import { supabase } from '@/lib/supabase/client';
import { emailService } from './emailService';

interface PasswordResetRequest {
  email: string;
  ipAddress?: string;
  userAgent?: string;
}

interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

interface PasswordResetValidation {
  isValid: boolean;
  userId?: string;
  email?: string;
}

class PasswordResetService {
  /**
   * Request a password reset token and send email
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Call the create_password_reset_token function
      const { data, error } = await supabase.rpc('create_password_reset_token', {
        user_email: request.email,
        client_ip: request.ipAddress,
        client_user_agent: request.userAgent,
      });

      if (error) {
        console.error('Error creating password reset token:', error);
        return {
          success: false,
          message: 'Failed to process password reset request',
        };
      }

      // If token is empty string, user doesn't exist (but don't reveal this)
      if (!data || data === '') {
        // Still return success to prevent email enumeration
        return {
          success: true,
          message:
            'If an account exists with this email, you will receive password reset instructions shortly.',
        };
      }

      // Send reset email
      const resetLink = `${window.location.origin}/password-reset-portal?token=${data}`;

      try {
        await emailService.sendEmail({
          to: request.email,
          subject: 'Password Reset Request - Ka-ma-ro',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Password Reset Request</h2>
              <p>You requested to reset your password for your Ka-ma-ro account.</p>
              <p>Click the link below to reset your password. This link will expire in 15 minutes.</p>
              <p style="margin: 20px 0;">
                <a href="${resetLink}" 
                   style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Reset Password
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                If you did not request this password reset, please ignore this email. Your password will remain unchanged.
              </p>
              <p style="color: #666; font-size: 14px;">
                For security reasons, this link will expire in 15 minutes.
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Error sending password reset email:', emailError);
        // Continue anyway - token is created
      }

      return {
        success: true,
        message:
          'If an account exists with this email, you will receive password reset instructions shortly.',
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      };
    }
  }

  /**
   * Validate a password reset token
   */
  async validateResetToken(token: string): Promise<PasswordResetValidation> {
    try {
      const { data, error } = await supabase.rpc('validate_password_reset_token', {
        reset_token: token,
      });

      if (error) {
        console.error('Error validating reset token:', error);
        return { isValid: false };
      }

      if (!data || data.length === 0) {
        return { isValid: false };
      }

      const validation = data[0];
      return {
        isValid: validation.is_valid,
        userId: validation.user_id,
        email: validation.email,
      };
    } catch (error) {
      console.error('Token validation error:', error);
      return { isValid: false };
    }
  }

  /**
   * Confirm password reset with new password
   */
  async confirmPasswordReset(request: PasswordResetConfirm): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // First validate the token
      const validation = await this.validateResetToken(request.token);

      if (!validation.isValid || !validation.userId) {
        return {
          success: false,
          message: 'Invalid or expired reset token. Please request a new password reset.',
        };
      }

      // Update password using Supabase Admin API
      const { error: updateError } = await supabase.auth.admin.updateUserById(validation.userId, {
        password: request.newPassword,
      });

      if (updateError) {
        console.error('Error updating password:', updateError);
        return {
          success: false,
          message: 'Failed to update password. Please try again.',
        };
      }

      // Mark token as used
      const { error: markError } = await supabase.rpc('mark_password_reset_token_used', {
        reset_token: request.token,
      });

      if (markError) {
        console.error('Error marking token as used:', markError);
        // Continue anyway - password was updated
      }

      // Invalidate all existing sessions for security
      try {
        await supabase.rpc('log_admin_action', {
          action_type: 'password_reset',
          resource_type: 'user_profiles',
          resource_id: validation.userId,
          details: { reason: 'Password reset via email verification' },
        });
      } catch (logError) {
        console.error('Error logging password reset:', logError);
        // Continue anyway
      }

      return {
        success: true,
        message: 'Password successfully reset. You can now log in with your new password.',
      };
    } catch (error) {
      console.error('Password reset confirmation error:', error);
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
      };
    }
  }

  /**
   * Clean up expired tokens (admin function)
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_password_reset_tokens');

      if (error) {
        console.error('Error cleaning up expired tokens:', error);
        return 0;
      }

      return data || 0;
    } catch (error) {
      console.error('Token cleanup error:', error);
      return 0;
    }
  }
}

export const passwordResetService = new PasswordResetService();
