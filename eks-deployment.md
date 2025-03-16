# EKS Deployment Guide for Kubernetes Application

## Overview

This document provides a comprehensive guide for deploying a containerized application with frontend and backend services from a local Minikube environment to Amazon EKS. The deployment uses AWS Application Load Balancer (ALB) with Ingress for routing traffic to the appropriate services.

## Prerequisites

- AWS CLI installed and configured with appropriate permissions
- `eksctl` command-line utility installed
- `kubectl` command-line utility installed
- `helm` package manager installed
- Docker images for frontend and backend pushed to a container registry

## Step 1: Create an EKS Cluster

Create a new Amazon EKS cluster using the `eksctl` tool:

```bash
eksctl create cluster \
  --name my-production-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3
```

**Note:** This process typically takes 10-15 minutes to complete. You can customize the region, node type, and node count according to your requirements.

## Step 2: Configure kubectl to Use Your New Cluster

Once the cluster is created, configure `kubectl` to use the new cluster:

```bash
aws eks update-kubeconfig --name my-production-cluster --region us-east-1
```

## Step 3: Set Up IAM Permissions for the ALB Controller

The AWS Load Balancer Controller requires specific IAM permissions to function correctly:

```bash
# Create an IAM policy for the ALB controller
aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json

# ================================================OR===================================================================
curl -o iam_policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json


aws iam create-policy-version --policy-arn arn:aws:iam::183295427320:policy/AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json --set-as-default




#OIDC Approve
eksctl utils associate-iam-oidc-provider --region=ap-south-1 --cluster=hilarious-monster-1741844485 --approve


# Create a service account for the ALB controller
eksctl create iamserviceaccount \
  --cluster=my-production-cluster \
  --namespace=kube-system \
  --name=aws-load-balancer-controller \
  --attach-policy-arn=arn:aws:iam::<your-aws-account-id>:policy/AWSLoadBalancerControllerIAMPolicy \
  --override-existing-serviceaccounts \
  --approve
```

Replace `<your-aws-account-id>` with your actual AWS account ID.

## Step 4: Install the AWS Load Balancer Controller

Install the controller using Helm:

```bash
# Add the EKS chart repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install the AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=my-production-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

## Step 5: Create Application Secrets

Create Kubernetes secrets for your application:

```bash
kubectl create secret generic app-secrets \
  --from-literal=DB_PASSWORD=your-prod-db-password \
  --from-literal=REACT_APP_API_URL=/api
```

Replace `your-prod-db-password` with your actual production database password.


## Step 6: Apply Configuration Files

Apply all configuration files to your EKS cluster:

```bash
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f ingress.yaml
```

## Step 7: Verify the Deployment

Verify that all components are correctly deployed:

```bash
# Check deployments
kubectl get deployments

# Check pods
kubectl get pods

# Check services
kubectl get services

# Check ingress (this might take a few minutes to provision the ALB)
kubectl get ingress
```

## Step 8: Get the Application URL

Retrieve the ALB endpoint to access your application:

```bash
kubectl get ingress app-ingress -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

Use this URL to access your application. The frontend will be available at the root path (`/`), and the backend will be accessible at the `/api` path.

## Future Steps: Adding Domain and SSL

When you're ready to add a custom domain and SSL:

1. Register a domain name (if you don't already have one)
2. Request an SSL certificate from AWS Certificate Manager (ACM)
3. Create a CNAME record in your DNS settings pointing to the ALB endpoint
4. Update the Ingress configuration with your domain and SSL certificate:


## Troubleshooting

### Common Issues

1. **ALB not provisioning**: Check the status of the AWS Load Balancer Controller:
   ```bash
   kubectl get pods -n kube-system | grep aws-load-balancer-controller
   ```

2. **Services not accessible**: Verify that your services are running and the endpoints are correct:
   ```bash
   kubectl get endpoints frontend-service backend-service
   ```

3. **IAM permissions**: Ensure your IAM permissions are correctly set up:
   ```bash
   kubectl describe serviceaccount aws-load-balancer-controller -n kube-system
   ```

## Resources

- [Amazon EKS Documentation](https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html)
- [AWS Load Balancer Controller Documentation](https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/)
- [Kubernetes Ingress Documentation](https://kubernetes.io/docs/concepts/services-networking/ingress/)
