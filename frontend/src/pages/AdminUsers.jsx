import { useEffect, useState } from "react";
import {
  getAllUsers,
  deleteUser,
  downloadCSV,
  downloadPDF,
  createUser
} from "../services/admin";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
    department: "",
    role: "employee"
  });

  /* LOAD USERS */
  const loadUsers = async () => {
    const res = await getAllUsers();
    setUsers(res.data || []);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ADD USER */
  const handleAddUser = async () => {
  if (
    !newUser.full_name ||
    !newUser.email ||
    !newUser.password ||
    !newUser.department
  ) {
    alert("Please fill all required fields");
    return;
  }

  try {
    await createUser(newUser);

    alert("User added successfully");

    setShowAdd(false);
    setNewUser({
      full_name: "",
      email: "",
      password: "",
      department: "",
      role: "employee"
    });

    loadUsers();
  } catch (err) {
    console.error(err.response?.data);

    alert(
      err.response?.data?.detail ||
      "Failed to add user"
    );
  }
};


  /* EXPORT */
  const exportFile = async (type) => {
    const res = type === "csv"
      ? await downloadCSV()
      : await downloadPDF();

    const blob = new Blob([res.data]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users.${type}`;
    a.click();
  };

  /* SEARCH */
  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toString().includes(search)
  );

  return (
    <div className="card user-mgmt-card">
      {/* HEADER */}
      <div className="user-header">
        <h3>👥 User Management</h3>

        <div className="user-actions">
          <button onClick={() => exportFile("csv")} className="btn outline">
            Export CSV
          </button>
          <button onClick={() => exportFile("pdf")} className="btn outline">
            Export PDF
          </button>
        </div>
      </div>

      {/* SEARCH + ADD */}
     <div className="search-add-row">
  <input
    type="text"
    placeholder="Search by name or ID"
    className="search-input"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  <button
    className="btn-primary"
    onClick={() => setShowAdd(!showAdd)}
  >
    + Add User
  </button>
</div>

      {/* ADD USER FORM */}
     {/* ADD USER INLINE FORM */}
{showAdd && (
  <div className="add-user-inline">
    <input
      type="text"
      placeholder="Name"
      value={newUser.full_name}
      onChange={(e) =>
        setNewUser({ ...newUser, full_name: e.target.value })
      }
    />

    <input
      type="email"
      placeholder="Email"
      value={newUser.email}
      onChange={(e) =>
        setNewUser({ ...newUser, email: e.target.value })
      }
    />

    <input
      type="text"
      placeholder="Department"
      value={newUser.department}
      onChange={(e) =>
        setNewUser({ ...newUser, department: e.target.value })
      }
    />

    <input
      type="password"
      placeholder="Password"
      value={newUser.password}
      onChange={(e) =>
        setNewUser({ ...newUser, password: e.target.value })
      }
    />

    <select
      value={newUser.role}
      onChange={(e) =>
        setNewUser({ ...newUser, role: e.target.value })
      }
    >
      <option value="employee">Employee</option>
      <option value="admin">Admin</option>
    </select>

    <button className="btn-primary" onClick={handleAddUser}>
      Add
    </button>
  </div>
)}


      {/* TABLE */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.length === 0 ? (
            <tr>
              <td colSpan="5" className="muted">
                No users found
              </td>
            </tr>
          ) : (
            filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.department}</td>
                <td>
                  <button
                    className="btn-danger"
                    onClick={() => {
                      if (window.confirm(`Delete ${u.full_name}?`)) {
                        deleteUser(u.id).then(loadUsers);
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
