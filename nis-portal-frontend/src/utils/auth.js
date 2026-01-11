export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user"); // 
  window.location.href = "/login";
};

export const getToken = () => localStorage.getItem("token");
