// Define role permissions
const rolePermissions = {
    student: [
      'view_jobs',
      'apply_jobs',
      'view_courses',
      'write_reviews',
      'view_profile',
      'edit_profile'
    ],
    employer: [
      'post_jobs',
      'view_applications',
      'manage_jobs',
      'view_student_profiles',
      'edit_company_profile'
    ],
    admin: [
      'manage_users',
      'manage_all_jobs',
      'manage_all_applications',
      'manage_institutions',
      'view_analytics',
      'system_settings'
    ]
  };
  
  module.exports = (allowedRoles, requiredPermission = null) => {
    return (req, res, next) => {
      try {
        // Check authentication
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }
  
        // Convert to array
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
        // Check role access
        const hasRoleAccess = roles.includes(req.user.role);
        
        if (!hasRoleAccess) {
          return res.status(403).json({
            success: false,
            message: `Insufficient role permissions. Required: ${roles.join(' or ')}`
          });
        }
  
        // Check specific permission if required
        if (requiredPermission) {
          const userPermissions = rolePermissions[req.user.role] || [];
          const hasPermission = userPermissions.includes(requiredPermission);
          
          if (!hasPermission) {
            return res.status(403).json({
              success: false,
              message: `Insufficient permissions. Required: ${requiredPermission}`
            });
          }
        }
  
        // Log access for admin monitoring
        if (req.user.role === 'admin') {
          console.log(`Admin access: ${req.user.email} - ${req.method} ${req.originalUrl}`);
        }
  
        next();
      } catch (error) {
        console.error('Role authorization error:', error);
        res.status(500).json({
          success: false,
          message: 'Authorization error'
        });
      }
    };
  };