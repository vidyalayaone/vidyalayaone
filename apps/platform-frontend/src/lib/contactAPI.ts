// contactAPI.ts
import emailjs from '@emailjs/browser';


// Types for contact form
export interface ContactFormData {
  name: string;
  email: string;
  school: string;
  message: string;
  [key: string]: unknown;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  response?: any;
  error?: string;
}

// EmailJS Configuration
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Initialize EmailJS (optional, but recommended)
emailjs.init(EMAILJS_PUBLIC_KEY);

export const sendContactEmail = async (formData: ContactFormData): Promise<ContactResponse> => {
  try {
    // Validate input
    if (!formData.name || !formData.email || !formData.message || !formData.school) {
      return {
        success: false,
        message: 'All fields are required'
      };
    }

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      formData,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email sent successfully:', response);
    
    return {
      success: true,
      message: 'Message sent successfully! We\'ll get back to you soon.',
      response: response
    };

  } catch (error) {
    console.error('EmailJS Error:', error);
    
    // Handle specific error types
    let errorMessage = 'Failed to send message. Please try again.';
    
    if (error.status === 422) {
      errorMessage = 'Invalid email format. Please check your email address.';
    } else if (error.status === 400) {
      errorMessage = 'Message sending failed. Please check all fields.';
    } else if (error.status === 403) {
      errorMessage = 'Service temporarily unavailable. Please try again later.';
    }

    return {
      success: false,
      message: errorMessage,
      error: error.text || error.message
    };
  }
};

// Optional: Test connection function
export const testEmailService = async (): Promise<boolean> => {
  try {
    const testParams = {
      from_name: 'Test User',
      from_email: 'test@example.com',
      message: 'This is a test message to verify EmailJS setup.',
      to_email: 'testemail@gmail.com'
    };

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      testParams,
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('EmailJS test successful!');
    return true;
  } catch (error) {
    console.error('EmailJS test failed:', error);
    return false;
  }
};

// Main contact API object that matches the expected interface
export const contactAPI = {
  submit: async (data: ContactFormData): Promise<void> => {
    const result = await sendContactEmail(data);
    if (!result.success) {
      throw new Error(result.message);
    }
  }
};
