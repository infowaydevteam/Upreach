import React, { useState } from "react";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUserCircle,
  FaFileAlt,
  FaUpload,
  FaCalendarAlt,
  FaClipboard,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./SideTabPanel.css";
import Accounts from "../Accounts/Accounts";
import Campaigns from "../Campaigns/Campaigns";
import CampaignCalendar from "../Campaigns/CampaignCalendar/CampaignCalendar";
import CampaignSetup from "../Campaigns/CampaignSetup/CampaignSetup";
import Dashboard from "../Dashboard/Dashboard";
import Users from "../Users/Users";
import UsingForm from "../Contacts/UsingForm/UsingForm";
import UsingExcelUpload from "../Contacts/UsingExcelUpload/UsingExcelUpload";
import ViewContacts from "../Contacts/ViewContacts/ViewContacts";
import CampaignConsentForm from "../Campaigns/CampaignConsentForm/CampaignConsentForm";
import TriggerCampaign from "../Campaigns/TriggerCampaign/TriggerCampaign";
import CampaignLogs from "../Campaigns/CampaignLogs/CampaignLogs";
import ManageLogs from "../ManageLogs/ManageLogs";


const SideTabPanel = () => {
  const [activeTab, setActiveTab] = useState("Accounts");
  const [isExpanded, setIsExpanded] = useState(true);
  const [isContactsExpanded, setContactsExpanded] = useState(false);
  const [isCampaignsExpanded, setCampaignsExpanded] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const username = localStorage.getItem("username");
  const email = localStorage.getItem("userEmail");

  const handleTabClick = (tab) => {
    if (tab === "Contacts") {
      setContactsExpanded(!isContactsExpanded);
      setActiveTab("Using Form"); // Always set to "Using Form" when expanding contacts
    } else if (tab === "Campaigns") {
      setCampaignsExpanded(!isCampaignsExpanded);
      setActiveTab("Campaign Setup"); // Default to "Campaign Setup" when expanding campaigns
    } else if (tab === "View Campaign Log") {
      setActiveTab("View Campaign Log");
    } else if (tab === "Manage Logs") {
      setContactsExpanded(false);
      setCampaignsExpanded(false);
      setActiveTab("Manage Logs"); // Ensure Manage Logs is handled
    } else {
      setContactsExpanded(false);
      setCampaignsExpanded(false);
      setActiveTab(tab);
    }
  };
  

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const handleLogout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("userEmail");
    alert("Logged out successfully!");
    navigate("/login");
  };

  return (
    <div className="side-tab-panel">
      <div className={`tabs ${isExpanded ? "expanded" : "collapsed"}`}>
        <div className="sidebar-header">
          <div className="brand-name1">UpReach</div>
          <button className="toggle-button" onClick={toggleSidebar}>
            {isExpanded ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Tabs */}
        {[
          "Accounts",
          "Contacts",
          "Campaigns",
          "Manage Logs",
          "Dashboard",
          "Users",
        ].map((tab) => (
          <div key={tab}>
            <div
              className={`tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => handleTabClick(tab)}
            >
              <span className="first-letter">{tab[0]}</span>
              <span className="full-text">{tab}</span>
            </div>

            {/* Contacts Submenu */}
            {tab === "Contacts" && isContactsExpanded && (
              <div className="contacts-sub-tabs">
                <div
                  className={`sub-tab ${activeTab === "Using Form" ? "active" : ""}`}
                  onClick={() => setActiveTab("Using Form")}
                >
                  <FaFileAlt className="sub-tab-icon" />
                  <span className="first-letter">F</span>
                  <span className="full-text">Using Form</span>
                </div>
                <div
                  className={`sub-tab ${activeTab === "Using Excel Upload" ? "active" : ""}`}
                  onClick={() => setActiveTab("Using Excel Upload")}
                >
                  <FaUpload className="sub-tab-icon" />
                  <span className="first-letter">E</span>
                  <span className="full-text">Using Excel Upload</span>
                </div>
                <div
                  className={`sub-tab ${activeTab === "ViewContacts" ? "active" : ""}`}
                  onClick={() => setActiveTab("ViewContacts")}
                >
                  <FaUpload className="sub-tab-icon" />
                  <span className="first-letter">V</span>
                  <span className="full-text">View Contacts</span>
                </div>
              </div>
            )}

            {/* Campaigns Submenu */}
            {tab === "Campaigns" && isCampaignsExpanded && (
              <div className="campaigns-sub-tabs">
                <div
                  className={`sub-tab ${activeTab === "Campaign Setup" ? "active" : ""}`}
                  onClick={() => setActiveTab("Campaign Setup")}
                >
                  <FaClipboard className="sub-tab-icon" />
                  <span className="first-letter">S</span>
                  <span className="full-text">Campaign Setup</span>
                </div>
                <div
                  className={`sub-tab ${activeTab === "Campaign Messages" ? "active" : ""}`}
                  onClick={() => setActiveTab("Campaign Messages")}
                >
                  <FaFileAlt className="sub-tab-icon" />
                  <span className="first-letter">M</span>
                  <span className="full-text">Campaign Messages</span>
                </div>
                <div
                  className={`sub-tab ${activeTab === "Campaign Calendar" ? "active" : ""}`}
                  onClick={() => setActiveTab("Campaign Calendar")}
                >
                  <FaCalendarAlt className="sub-tab-icon" />
                  <span className="first-letter">C</span>
                  <span className="full-text">Campaign Calendar</span>
                </div>
                <div
                  className={`sub-tab ${activeTab === "Trigger Campaign" ? "active" : ""}`}
                  onClick={() => setActiveTab("Trigger Campaign")}
                >
                  <FaUpload className="sub-tab-icon" />
                  <span className="first-letter">T</span>
                  <span className="full-text">Trigger Campaign</span>
                </div>
                <div
                  className={`sub-tab ${activeTab === "View Campaign Log" ? "active" : ""}`}
                  onClick={() => setActiveTab("View Campaign Log")}
                >
                  <FaFileAlt className="sub-tab-icon" />
                  <span className="first-letter">L</span>
                  <span className="full-text">View Campaign Log</span>
                </div>
                <div
                  className={`sub-tab ${activeTab === "Campaign Consent Form" ? "active" : ""}`}
                  onClick={() => setActiveTab("Campaign Consent Form")}
                >
                  <FaClipboard className="sub-tab-icon" />
                  <span className="first-letter">F</span>
                  <span className="full-text">Campaign Consent Form</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Logout Section */}
        <div className="logout-container" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          {isExpanded && <span className="logout-text">Logout</span>}
        </div>
      </div>

      {/* Profile Menu */}
      <div className="profile-button-container" onClick={() => setMenuOpen(!isMenuOpen)}>
        <FaUserCircle className="profile-icon" />
      </div>
      {isMenuOpen && (
        <div className="profile-menu">
          <div className="profile-menu-item">
            <span className="username">{username}</span>
            <div className="email">{email}</div>
          </div>
          <div className="profile-menu-item">Profile</div>
          <div className="profile-menu-item">Settings</div>
          <div className="profile-menu-item" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" /> Logout
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="content">
        {activeTab === "Accounts" && <Accounts />}
        {activeTab === "Campaign Messages" && <Campaigns />}
        {activeTab === "Campaign Calendar" && <CampaignCalendar />}
        {activeTab === "Campaign Setup" && <CampaignSetup />}
        {activeTab === "Manage Logs" && <ManageLogs />}
        {activeTab === "Dashboard" && <Dashboard />}
        {activeTab === "Users" && <Users />}
        {activeTab === "Using Form" && <UsingForm />}
        {activeTab === "Using Excel Upload" && <UsingExcelUpload />}
        {activeTab === "ViewContacts" && <ViewContacts />}
        {activeTab === "Campaign Consent Form" && <CampaignConsentForm />}
        {activeTab === "View Campaign Log" && <CampaignLogs />} {/* View Campaign Log Component */}
        {activeTab === "Trigger Campaign" && <TriggerCampaign />}
      </div>
    </div>
  );
};

export default SideTabPanel;
