"use client";
const { useRouter } = require("next/navigation");
const { useState, useEffect } = require("react");

function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Simulating user data fetch
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(storedUser);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Welcome, {user?.firstName} {user?.lastName}!
        </h2>
        <p className="mb-4">Email: {user?.email}</p>
        <button
          className="w-full bg-red-500 text-white p-2 rounded"
          onClick={() => {
            localStorage.removeItem("user");
            router.push("/sign-in");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard