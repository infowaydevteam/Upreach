import React, { useState, useEffect } from "react";
import "./ManageLogs.css";
import config from "../config";
import { FaCheckCircle, FaReply, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ManageLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState([]); // For sent messages
  const [receivedMessages, setReceivedMessages] = useState([]); // For received messages
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(20);

  const formatSentDate = (dateString) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  };

  const formatReceivedDate = (dateString) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${month} ${day} ${year} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchLogs = async () => {
      const userEmail = localStorage.getItem("userEmail");

      if (!userEmail) {
        console.error("User email not found in localStorage.");
        return;
      }

      try {
        const responseSentMessages = await fetch(
          `${config.apiBaseUrl}/api/getSentCampaignSms?email=${encodeURIComponent(userEmail)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const resultSentMessages = await responseSentMessages.json();

        if (responseSentMessages.ok) {
          setLogs(resultSentMessages.data);
        } else {
          console.error("Error fetching sent messages:", resultSentMessages.message);
        }

        const responseReceivedMessages = await fetch(
          `${config.apiBaseUrl}/api/getReceivedMessages?email=${encodeURIComponent(userEmail)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const resultReceivedMessages = await responseReceivedMessages.json();

        if (Array.isArray(resultReceivedMessages.messages)) {
          setReceivedMessages(resultReceivedMessages.messages);
        } else {
          console.error("Received messages are not in the expected array format.");
          setReceivedMessages([]); 
        }

      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchLogs();
  }, []);

  const allLogs = [...logs, ...receivedMessages];

  const sortedLogs = allLogs.sort((a, b) => {
    const dateA = a.sent_at ? new Date(a.sent_at) : new Date(a.date_received);
    const dateB = b.sent_at ? new Date(b.sent_at) : new Date(b.date_received);
    return dateB - dateA;
  });

  const getStatus = (log) => {
    if (log.sent_at) {
      return { status: "Sent", color: "green", icon: <FaCheckCircle /> };
    } else if (log.date_received) {
      return { status: "Received", color: "blue", icon: <FaReply /> };
    }
    return { status: "Unknown", color: "gray", icon: null };
  };

  const filteredLogs = sortedLogs.filter(
    (log) =>
      log.phone?.includes(searchTerm) ||
      log.campaign_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sent_at?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.contact_name && log.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.message_body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="manage-logs-container">
      <h2 className="manage-logs-title">Message Logs</h2>

      <div className="manage-logs-search-container">
        <input
          type="text"
          placeholder="Search by campaign ID, phone, message, or contact name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="manage-logs-search-input"
        />
      </div>

      <table className="manage-logs-table">
        <thead>
          <tr className="manage-logs-header-row">
            <th className="manage-logs-header-cell">Campaign ID</th>
            <th className="manage-logs-header-cell">Contact Name</th>
            <th className="manage-logs-header-cell">Phone Number</th>
            <th className="manage-logs-header-cell">Sent Message</th>
            <th className="manage-logs-header-cell">Received Message</th>
            <th className="manage-logs-header-cell">Status</th>
            <th className="manage-logs-header-cell">Date and Time</th>
          </tr>
        </thead>
        <tbody className="manage-logs-body">
          {currentLogs.length > 0 ? (
            currentLogs.map((log, index) => {
              const { status, color, icon } = getStatus(log);
              return (
                <tr key={index} className="manage-logs-row">
                  <td className="manage-logs-cell">{log.campaign_id || "N/A"}</td>
                  <td className="manage-logs-cell">{log.contact_name || "Unknown"}</td>
                  <td className="manage-logs-cell">{log.phone || log.from_phone_number}</td>
                  <td className="manage-logs-cell">{log.message || "No sent message"}</td>
                  <td className="manage-logs-cell">{log.message_body || "No received message"}</td>
                  <td className="manage-logs-cell">
                    <span style={{ color: color }}>
                      {icon} {status}
                    </span>
                  </td>
                  <td className="manage-logs-cell">
                    {log.sent_at
                      ? formatSentDate(log.sent_at)
                      : log.date_received
                      ? formatReceivedDate(log.date_received)
                      : "N/A"}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr className="manage-logs-no-results-row">
              <td colSpan="7" className="manage-logs-no-results-cell">
                No logs found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination-container">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          <FaChevronLeft className="pagination-arrow" />
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          <FaChevronRight className="pagination-arrow" />
        </button>
      </div>
    </div>
  );
};

export default ManageLogs;
