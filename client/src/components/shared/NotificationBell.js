import React, { useState, useEffect } from 'react';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sample notifications - replace with actual data from your backend
  const sampleNotifications = [
    {
      id: 1,
      title: "New Job Match",
      message: "Software Developer at Tech Solutions matches your profile",
      time: "2 hours ago",
      read: false,
      type: "job"
    },
    {
      id: 2,
      title: "Application Update",
      message: "Your application at Creative Agency has been viewed",
      time: "1 day ago",
      read: false,
      type: "application"
    },
    {
      id: 3,
      title: "Course Recommendation",
      message: "New Computer Science courses available at NUL",
      time: "2 days ago",
      read: true,
      type: "course"
    }
  ];

  useEffect(() => {
    // In a real app, fetch notifications from your API
    setNotifications(sampleNotifications);
    setUnreadCount(sampleNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
    setUnreadCount(prev => prev - 1);
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      job: "💼",
      application: "📝",
      course: "🎓",
      alert: "⚠️",
      default: "🔔"
    };
    return icons[type] || icons.default;
  };

  return (
    <div className="dropdown">
      {/* Notification Bell */}
      <button
        className="btn btn-outline-light position-relative border-0"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Notifications"
      >
        <span style={{ fontSize: '1.2rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="dropdown-menu show dropdown-menu-end shadow" style={{ width: '350px' }}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center p-4 text-muted">
                <div style={{ fontSize: '2rem' }}>🔔</div>
                <p className="mb-0 mt-2">No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`dropdown-item p-3 border-bottom ${!notification.read ? 'bg-light' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-start">
                    <span className="me-3" style={{ fontSize: '1.2rem' }}>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-1 small">{notification.title}</h6>
                        {!notification.read && (
                          <span className="badge bg-primary badge-dot"></span>
                        )}
                      </div>
                      <p className="mb-1 small text-muted">{notification.message}</p>
                      <small className="text-muted">{notification.time}</small>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2 border-top">
            <button className="btn btn-sm btn-outline-secondary w-100">
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="position-fixed top-0 left-0 w-100 h-100"
          onClick={() => setShowDropdown(false)}
          style={{ zIndex: 1040 }}
        ></div>
      )}
    </div>
  );
}