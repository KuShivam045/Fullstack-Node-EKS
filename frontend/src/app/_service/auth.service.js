const API_URL = " http://localhost:3030/api";

export const AuthService = {
  login: async (email, password, role) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    if (!response.ok) throw new Error("Invalid credentials");
    return response.json();
  },
  register: async (firstName, lastName, email, password, role) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password, role }),
    });
    if (!response.ok) throw new Error("Registration failed");
    return response.json();
  },
  details: async (token) => {
    const response = await fetch(`${API_URL}/details`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("Registration failed");
    return response.json();
  },
};
