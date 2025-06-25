import API from "../api/axios";

const AcknowledgeButton = ({ id }) => {
  const acknowledge = async () => {
    await API.post(`/feedback/${id}/acknowledge`);
    window.location.reload();
  };

  return <button onClick={acknowledge}>Acknowledge</button>;
};

export default AcknowledgeButton;
