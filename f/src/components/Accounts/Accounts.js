import React, { useEffect, useState } from 'react';
import config from '../config';

const Accounts = () => {
  const [email, setEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [industry, setIndustry] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [natureOfBusiness, setNatureOfBusiness] = useState('');
  const [customerList, setCustomerList] = useState([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      fetchCustomerAccounts(storedEmail);
    }
  }, []);

  const fetchCustomerAccounts = async (userEmail) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/api/customer?email=${userEmail}`);
      const data = await response.json();
      if (data.data) {
        setCustomerList(data.data);
      }
    } catch (err) {
      console.error('Error fetching customer accounts:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newCustomer = {
      email,
      customerName,
      customerEmail,
      industry,
      subdomain,
      natureOfBusiness,
    };

    try {
      const response = await fetch(`${config.apiBaseUrl}/api/customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });

      const data = await response.json();
      if (data.data) {
        setCustomerName('');
        setCustomerEmail('');
        setIndustry('');
        setSubdomain('');
        setNatureOfBusiness('');
        fetchCustomerAccounts(email);
      } else {
        alert('Error saving customer details');
      }
    } catch (err) {
      console.error('Error saving customer details:', err);
    }
  };

  const handleClear = () => {
    setCustomerName('');
    setCustomerEmail('');
    setIndustry('');
    setSubdomain('');
    setNatureOfBusiness('');
  };

  return (
    <div style={{
      padding: '45px 60px',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      background: 'linear-gradient(135deg, #f3f5f7, #e0e7f1)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
      maxWidth: '1300px',
      margin: '0 auto',
      color: 'rgb(0, 61, 148);',
      overflowY: 'auto',
      height: '100vh',
      borderRadius: '10px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      animation: 'fadeIn 0.5s ease-in-out',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '15px',
        boxShadow: '0 15px 45px rgba(0, 0, 0, 0.1)',
        marginTop: '20px',
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        transition: 'box-shadow 0.3s ease',
      }}>
        <h3 style={{
          fontSize: '32px',
          color: '#003d94',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '15px',
        }}>Customer Account Setup</h3>
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            gap: '30px',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <label htmlFor="customerName" style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#555',
                display: 'block',
                marginBottom: '20px',
              }}>Customer Name:</label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease',
                }}
              />
            </div>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <label htmlFor="industry" style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#555',
                display: 'block',
                marginBottom: '20px',
              }}>Industry:</label>
              <input
                type="text"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease',
                }}
              />
            </div>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <label htmlFor="natureOfBusiness" style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#555',
                display: 'block',
                marginBottom: '20px',
              }}>Nature of Business:</label>
              <input
                type="text"
                id="natureOfBusiness"
                value={natureOfBusiness}
                onChange={(e) => setNatureOfBusiness(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease',
                }}
              />
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '30px',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <label htmlFor="customerEmail" style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#555',
                display: 'block',
                marginTop:'20px',
                marginBottom: '20px',
              }}>Customer Email:</label>
              <input
                type="email"
                id="customerEmail"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  marginBottom:'20px',
                  transition: 'border-color 0.3s ease',
                }}
              />
            </div>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <label htmlFor="subdomain" style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#555',
                display: 'block',
                marginTop:'20px',
                marginBottom: '20px',
              }}>Subdomain:</label>
              <input
                type="text"
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s ease',
                }}
              />
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '20px',
          }}>
            <button type="submit" style={{
              padding: '14px 30px',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              width: '48%',
              backgroundColor: '#003d94',
              color: 'white',
              border: 'none',
            }}>Save</button>
            <button type="button" style={{
              padding: '14px 30px',
              fontSize: '16px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              width: '48%',
              backgroundColor: '#f1f1f1',
              color: 'white',
              border: '1px solid #ddd',
            }} onClick={handleClear}>Clear</button>
          </div>
        </form>
      </div>

      <div style={{
        marginTop: '50px',
        width: '100%',
        maxWidth: '1200px',
        padding: '30px',
        backgroundColor: '#ffffff',
        borderRadius: '15px',
        boxShadow: '0 15px 45px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <h3 style={{
          fontSize: '28px',
          fontWeight: '600',
          textAlign: 'center',
          marginBottom: '20px',
        }}>Customer List</h3>
        <div style={{
          width: '100%',
          maxHeight: '240px', // Approx height for 4 rows (adjust if needed)
          overflowY: 'auto',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
          }}>
            <thead>
              <tr>
                <th style={{
                  padding: '14px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: 'white',
                  borderBottom: '2px solid #ddd',
                  backgroundColor: 'rgb(0, 61, 148)', // Add a background color for header
                  textTransform: 'none', // Explicitly prevent uppercase transformation
                  position: 'sticky',
                  top: 0, // Keeps the header at the top when scrolling
                  zIndex: 1, // Ensures the header stays above table rows
                }}>Customer Name</th>
                <th style={{
                  padding: '14px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: 'white',
                  borderBottom: '2px solid #ddd',
                  backgroundColor: 'rgb(0, 61, 148)',
                  textTransform: 'none', // Explicitly prevent uppercase transformation
                  position: 'sticky',
                  top: 0, // Keeps the header at the top when scrolling
                  zIndex: 1, // Ensures the header stays above table rows
                }}>Email</th>
                <th style={{
                  padding: '14px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: 'white',
                  borderBottom: '2px solid #ddd',
                  backgroundColor: 'rgb(0, 61, 148)',
                  textTransform: 'none', // Explicitly prevent uppercase transformation
                  position: 'sticky',
                  top: 0, // Keeps the header at the top when scrolling
                  zIndex: 1, // Ensures the header stays above table rows
                }}>Industry</th>
                <th style={{
                  padding: '14px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: 'white',
                  borderBottom: '2px solid #ddd',
                  backgroundColor: 'rgb(0, 61, 148)',
                  textTransform: 'none', // Explicitly prevent uppercase transformation
                  position: 'sticky',
                  top: 0, // Keeps the header at the top when scrolling
                  zIndex: 1, // Ensures the header stays above table rows
                }}>Subdomain</th>
                <th style={{
                  padding: '14px',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: 'white',
                  borderBottom: '2px solid #ddd',
                  backgroundColor: 'rgb(0, 61, 148)',
                  textTransform: 'none', // Explicitly prevent uppercase transformation
                  position: 'sticky',
                  top: 0, // Keeps the header at the top when scrolling
                  zIndex: 1, // Ensures the header stays above table rows
                }}>Nature of Business</th>
              </tr>
            </thead>
            <tbody>
              {customerList.map((customer, index) => (
                <tr key={index}>
                  <td style={{
                                                          textAlign: 'left',

                    padding: '12px',
                    borderBottom: '1px solid #ddd',
                  }}>{customer.customer_name}</td>
                  <td style={{
                                                          textAlign: 'left',

                    padding: '12px',
                    borderBottom: '1px solid #ddd',
                  }}>{customer.customer_email}</td>
                  <td style={{
                                                          textAlign: 'left',

                    padding: '12px',
                    borderBottom: '1px solid #ddd',
                  }}>{customer.industry}</td>
                  <td style={{
                                                          textAlign: 'left',

                    padding: '12px',
                    borderBottom: '1px solid #ddd',
                  }}>{customer.subdomain}</td>
                  <td style={{
                                                          textAlign: 'left',

                    padding: '12px',
                    borderBottom: '1px solid #ddd',
                  }}>{customer.nature_of_business}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Accounts;
