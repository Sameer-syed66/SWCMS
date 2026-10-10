import api from "./api";

export const authService = {
  async login(usernameOrEmail, password, role) {
    const response = await api.post("/auth/login", {
      email: usernameOrEmail,
      username: usernameOrEmail,
      password,
      role
    });
    return response.data;
  },
  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data;
  }
};
