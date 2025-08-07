import axios from 'axios';
import config from '../config/config';

class SmsService {
  private apiKey: string;
  private testNumbers: string[];  // Use for whitelisted test numbers (Fast2SMS test)

  constructor() {
    this.apiKey = config.sms.fast2smsApiKey;
    this.testNumbers = config.sms.testNumbers ? config.sms.testNumbers.split(',') : [];
  }

  async sendOtpSMS(phone: string, otp: string, isTest: boolean = false): Promise<void> {
    const payload: any = {
      route: 'otp',
      variables_values: otp,
      numbers: phone
    };

    // For test mode, Fast2SMS only delivers to pre-whitelisted test numbers with a dummy "otp" message
    if (isTest) {
      // You can only send to test numbers; Fast2SMS ignores others in test
      payload.route = 'otp';
      // Optionally: you may want to validate phone is in testNumbers during test mode
    } else {
      payload.route = 'otp';  // For live mode, you may need to use your actual template
      payload.message = `Your OnlyExams OTP is ${otp}`; // Optional, use template if needed
    }

    try {
      const result = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        payload,
        {
          headers: {
            'authorization': this.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );
      if (result.data && result.data.return) {
        console.log(`✅ OTP SMS sent to ${phone}`);
      } else {
        throw new Error(JSON.stringify(result.data));
      }
    } catch (error: any) {
      console.error('❌ SMS sending failed:', error.response?.data || error.message);
      throw new Error('Failed to send OTP SMS');
    }
  }

  async testConnection(): Promise<boolean> {
    // Fast2SMS doesn't offer a ping, but we can try to send to test numbers
    try {
      if (this.testNumbers.length === 0) {
        console.warn('⚠️ No test numbers configured in .env!');
        return false;
      }
      await this.sendOtpSMS(this.testNumbers[0], '123456', true);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export default new SmsService();
