const [managerId, setManagerId] = useState("");
const [managers, setManagers] = useState([]);

useEffect(() => {
  // Fetch list of available managers (you can create an API for this if not existing)
  axios.get("/users/managers", {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => setManagers(res.data));
}, []);

const handleRequest = async () => {
  try {
    await axios.post("/feedback/feedback-request/", { manager_id: managerId }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert("Request sent!");
  } catch (err) {
    console.error(err);
    alert("Failed to send request");
  }
};
