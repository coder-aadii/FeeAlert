const cron = require('node-cron');
const Client = require('../models/clientModel');
const sendEmail = require('../utils/sendEmail');
const logger = require('../utils/logger');  // We'll create this for proper logging

class AutomatedReminderService {
    constructor() {
        this.isRunning = false;
    }

    // Initialize the service
    initialize() {
        // Schedule reminders every day at 10:00 AM
        cron.schedule('0 10 * * *', () => {
            this.sendDailyReminders();
        });

        logger.info('Automated reminder service initialized');
    }

    // Get slot details based on date
    getSlotDetails(day) {
        if (day >= 1 && day <= 5) {
            return {
                slot: 'slot1',
                paymentPeriod: '1st - 5th',
                duePeriod: '1st - 10th'
            };
        } else if (day >= 15 && day <= 20) {
            return {
                slot: 'slot2',
                paymentPeriod: '15th - 20th',
                duePeriod: '11th - 20th'
            };
        } else if (day >= 25 && day <= 30) {
            return {
                slot: 'slot3',
                paymentPeriod: '25th - 30th',
                duePeriod: '21st - 31st'
            };
        }
        return null;
    }

    // Send daily reminders
    async sendDailyReminders() {
        if (this.isRunning) {
            logger.warn('Reminder service already running, skipping this execution');
            return;
        }

        this.isRunning = true;
        const today = new Date();
        const day = today.getDate();

        try {
            const slotDetails = this.getSlotDetails(day);
            
            if (!slotDetails) {
                logger.info('Today is not a payment day, no reminders needed');
                return;
            }

            logger.info(`Starting reminders for ${slotDetails.paymentPeriod}`);

            const clients = await this.getClientsForSlot(slotDetails);
            logger.info(`Found ${clients.length} clients for ${slotDetails.paymentPeriod}`);

            for (const client of clients) {
                try {
                    await this.sendReminderToClient(client, slotDetails);
                } catch (error) {
                    // Error is already logged in sendReminderToClient
                }
            }

            logger.info(`Completed sending reminders for ${slotDetails.paymentPeriod}`);

        } catch (error) {
            logger.error('Error in automated reminders:', error);
        } finally {
            this.isRunning = false;
        }
    }

    // Get clients for a specific slot
    async getClientsForSlot(slotDetails) {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        return await Client.find({
            paymentSlot: slotDetails.slot,
            status: 'active',
            paymentStatus: 'pending',
            $or: [
                { lastReminderSent: null },
                { lastReminderSent: { $lt: startOfDay } }
            ]
        });
    }

    // Send reminder to a single client
    async sendReminderToClient(client, slotDetails) {
        try {
            const result = await sendEmail({
                to: client.email,
                subject: 'Fee Payment Window Open - Action Required',
                text: `Fee Payment Reminder for ${slotDetails.paymentPeriod}`,
                html: this.generateEmailTemplate(client, slotDetails)
            });

            // Update reminder history
            await client.addReminderHistory({
                type: 'automated',
                status: 'sent',
                messageId: result.messageId
            });

            logger.info(`Reminder sent successfully to ${client.email}`);
            return true;
        } catch (error) {
            // Log failed attempt
            await client.addReminderHistory({
                type: 'automated',
                status: 'failed',
                error: error.message
            });

            logger.error(`Failed to send reminder to ${client.email}:`, error);
            throw error;
        }
    }

    // Generate email template with client-specific information
    generateEmailTemplate(client, slotDetails) {
        const paymentSection = client.paymentHistory && client.paymentHistory.length > 0 
            ? `
                <div style="background-color: #f8f9fa; padding: 15px; margin-top: 15px;">
                    <h4>Last Payment</h4>
                    <p>Date: ${client.lastPaymentDate ? client.lastPaymentDate.toLocaleDateString() : 'N/A'}</p>
                    <p>Amount: ₹${client.paymentHistory[client.paymentHistory.length - 1].amount}</p>
                </div>
            `
            : '';

        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2c3e50;">Fee Payment Reminder</h2>
                <p>Dear ${client.name},</p>
                
                <p>This is a reminder that your fee payment window is currently open.</p>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #2c3e50; margin-top: 0;">Payment Details</h3>
                    <p><strong>Payment Window:</strong> ${slotDetails.paymentPeriod} of this month</p>
                    <p><strong>Due Date:</strong> ${new Date(client.feeDueDate).toLocaleDateString()}</p>
                    ${client.feeAmount ? `<p><strong>Amount:</strong> ₹${client.feeAmount}</p>` : ''}
                </div>
                
                ${paymentSection}
                
                <p style="color: #e74c3c;"><strong>Important:</strong> Please ensure to make the payment within the current payment window (${slotDetails.paymentPeriod}) to avoid any late fee charges.</p>

                <p style="color: #666; font-style: italic;">If you have already made the payment, please disregard this reminder and accept our thanks.</p>
                
                <p style="margin-top: 20px;">Best regards,<br>FeeAlert Team</p>

                <div style="color: #666; font-size: 12px; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
                    <p>This is an automated reminder. Please do not reply to this email.</p>
                    <p>For any queries, please contact our support team.</p>
                </div>
            </div>
        `;
    }
}

module.exports = new AutomatedReminderService();
