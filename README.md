# GitHub Actions CI/CD Pipeline for EKS Deployment

This guide will help you set up a complete CI/CD pipeline using GitHub Actions to automate the deployment of your application to Amazon EKS.

## Overview

The pipeline will handle the following tasks:
1. Build and test your application
2. Build Docker images for frontend and backend
3. Push images to a container registry (AWS ECR)
4. Deploy the application to your EKS cluster
5. Perform validation tests

## Prerequisites

- GitHub repository containing your application code
- AWS account with EKS cluster already set up
- AWS ECR repositories for your frontend and backend images
- IAM user with appropriate permissions for GitHub Actions

## Step 1: Create AWS IAM User for GitHub Actions

First, create an IAM user with the necessary permissions:

1. Navigate to the AWS IAM console
2. Create a new user with programmatic access
3. Attach the following policies:
   - `AmazonECR-FullAccess`
   - `AmazonEKSClusterPolicy`
   - Custom policy for EKS deployments (see below)

Create a custom policy for EKS deployments:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "eks:DescribeCluster",
        "eks:ListClusters",
        "eks:UpdateClusterConfig"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "eks:*"
      ],
      "Resource": "arn:aws:eks:*:*:cluster/my-production-cluster"
    }
  ]
}
```

Save the Access Key ID and Secret Access Key for the next step.

## Step 2: Set Up GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `AWS_ACCESS_KEY_ID`: Your IAM user access key
   - `AWS_SECRET_ACCESS_KEY`: Your IAM user secret key
   - `ECR_REPOSITORY_FRONTEND`: The name of your frontend ECR repository
   - `ECR_REPOSITORY_BACKEND`: The name of your backend ECR repository
   - `AWS_REGION`: Your AWS region (e.g., us-east-1)
   - `EKS_CLUSTER_NAME`: Your EKS cluster name
   - `DB_PASSWORD`: Your database password for production

## Step 3: Create GitHub Actions Workflow Files

Create the following workflow files in your repository under `.github/workflows/`:

### Main CI/CD Workflow

Create a file named `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy to EKS

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

env:
  AWS_REGION: ${{ secrets.AWS_REGION }}
  ECR_REPOSITORY_FRONTEND: ${{ secrets.ECR_REPOSITORY_FRONTEND }}
  ECR_REPOSITORY_BACKEND: ${{ secrets.ECR_REPOSITORY_BACKEND }}
  EKS_CLUSTER_NAME: ${{ secrets.EKS_CLUSTER_NAME }}

jobs:
  test:
    name: Test Application
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: '**/package-lock.json'

      # Add frontend tests
      - name: Install frontend dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Run frontend tests
        working-directory: ./frontend
        run: npm test

      # Add backend tests
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'

      - name: Install backend dependencies
        working-directory: ./backend
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Run backend tests
        working-directory: ./backend
        run: pytest

  build-and-push:
    name: Build and Push Docker Images
    needs: test
    runs-on: ubuntu-latest
    outputs:
      frontend-image: ${{ steps.build-frontend.outputs.image }}
      backend-image: ${{ steps.build-backend.outputs.image }}
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push frontend image to Amazon ECR
        id: build-frontend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG -t $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:latest ./frontend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Build, tag, and push backend image to Amazon ECR
        id: build-backend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG -t $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:latest ./backend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG" >> $GITHUB_OUTPUT

  deploy:
    name: Deploy to EKS
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name ${{ env.EKS_CLUSTER_NAME }} --region ${{ env.AWS_REGION }}

      - name: Create or update application secrets
        run: |
          kubectl get secret app-secrets &> /dev/null || kubectl create secret generic app-secrets \
            --from-literal=DB_PASSWORD='${{ secrets.DB_PASSWORD }}' \
            --from-literal=REACT_APP_API_URL='/api'

      - name: Deploy frontend
        env:
          FRONTEND_IMAGE: ${{ needs.build-and-push.outputs.frontend-image }}
        run: |
          cat << EOF > frontend-deployment.yaml
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: frontend-deployment
          spec:
            replicas: 2
            selector:
              matchLabels:
                app: frontend
            template:
              metadata:
                labels:
                  app: frontend
              spec:
                containers:
                - name: frontend
                  image: ${FRONTEND_IMAGE}
                  ports:
                  - containerPort: 80
                  env:
                  - name: REACT_APP_API_URL
                    valueFrom:
                      secretKeyRef:
                        name: app-secrets
                        key: REACT_APP_API_URL
                  resources:
                    requests:
                      memory: "128Mi"
                      cpu: "100m"
                    limits:
                      memory: "256Mi"
                      cpu: "200m"
          EOF
          kubectl apply -f frontend-deployment.yaml
          kubectl apply -f frontend-service.yaml

      - name: Deploy backend
        env:
          BACKEND_IMAGE: ${{ needs.build-and-push.outputs.backend-image }}
        run: |
          cat << EOF > backend-deployment.yaml
          apiVersion: apps/v1
          kind: Deployment
          metadata:
            name: backend-deployment
          spec:
            replicas: 2
            selector:
              matchLabels:
                app: backend
            template:
              metadata:
                labels:
                  app: backend
              spec:
                containers:
                - name: backend
                  image: ${BACKEND_IMAGE}
                  ports:
                  - containerPort: 8080
                  env:
                  - name: DB_PASSWORD
                    valueFrom:
                      secretKeyRef:
                        name: app-secrets
                        key: DB_PASSWORD
                  resources:
                    requests:
                      memory: "256Mi"
                      cpu: "200m"
                    limits:
                      memory: "512Mi"
                      cpu: "400m"
          EOF
          kubectl apply -f backend-deployment.yaml
          kubectl apply -f backend-service.yaml
          kubectl apply -f ingress.yaml

      - name: Verify deployment
        run: |
          kubectl rollout status deployment/frontend-deployment
          kubectl rollout status deployment/backend-deployment
          echo "Waiting for ingress to be ready..."
          sleep 30
          kubectl get ingress app-ingress

  validate:
    name: Validate Deployment
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name ${{ env.EKS_CLUSTER_NAME }} --region ${{ env.AWS_REGION }}

      - name: Get ALB URL
        id: get-alb-url
        run: |
          alb_url=$(kubectl get ingress app-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
          echo "ALB_URL=$alb_url" >> $GITHUB_OUTPUT
          echo "Application is available at: http://$alb_url"

      - name: Health check
        run: |
          alb_url="${{ steps.get-alb-url.outputs.ALB_URL }}"
          echo "Performing health check on frontend..."
          curl -f -s -o /dev/null -w "%{http_code}" "http://$alb_url/" || exit 1
          echo "Performing health check on backend..."
          curl -f -s -o /dev/null -w "%{http_code}" "http://$alb_url/api/health" || exit 1
          echo "Health checks passed!"
```

### Frontend and Backend Deployment and Service Files

Create the following file in your repository as `frontend-service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP
```

Create the following file in your repository as `backend-service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
```

Create the following file in your repository as `ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    kubernetes.io/ingress.class: alb
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
spec:
  rules:
  - http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 80
```

## Step 4: Add Health Check Endpoint to Backend

Make sure your backend application has a health check endpoint at `/api/health` that returns a 200 OK status. This is used by the CI/CD pipeline to verify the deployment.

For example, if using Express.js:

```javascript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
```

Or if using Python Flask:

```python
@app.route('/health')
def health():
    return jsonify({"status": "ok"}), 200
```

## Step 5: Add Dockerfile for Frontend and Backend

Create a `Dockerfile` in your frontend directory:

```dockerfile
FROM node:18 as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Create an `nginx.conf` file in your frontend directory:

```
server {
    listen 80;
    server_name _;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Create a `Dockerfile` in your backend directory (example for Python):

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]
```

## Step 6: Run the CI/CD Pipeline

Push the changes to your GitHub repository:

```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

The pipeline will automatically run when you push to the main branch. You can also manually trigger it from the Actions tab in your GitHub repository.

## GitHub Actions Workflow Explanation

The CI/CD pipeline consists of four main jobs:

1. **Test**: Runs tests for both frontend and backend to ensure code quality.
2. **Build and Push**: Builds Docker images for frontend and backend, then pushes them to Amazon ECR.
3. **Deploy**: Updates the Kubernetes manifests with the new image tags and applies them to the EKS cluster.
4. **Validate**: Verifies that the deployment was successful by checking the health endpoints.

## Additional Notes