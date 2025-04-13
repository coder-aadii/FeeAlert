require('dotenv').config();
const mongoose = require('mongoose');
const { sendSlotReminders } = require('./utils/automatedReminders');

// Mock date for testing
const mockDate = (date) => {
    const RealDate = Date;
    global.Date = class extends RealDate {
        constructor(...args) {
            if (args.length === 0) {
                return new RealDate(date);
            }
            return new RealDate(...args);
        }
        static now() {
            return new RealDate(date).getTime();
        }
    };
};

// Reset Date to original
const resetDate = () => {
    global.Date = Date;
};

// Test function for a specific date
const testSlot = async (testDate) => {
    try {
        mockDate(testDate);
        console.log(`\n=== Testing for ${new Date(testDate).toLocaleDateString()} ===`);
        await sendSlotReminders();
    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        resetDate();
    }
};

// Main test function
const runTests = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for testing\n');

        // Test Slot 1 (1st - 5th)
        await testSlot('2024-02-03T10:00:00');  // Should send reminders
        
        // Test Slot 2 (15th - 20th)
        await testSlot('2024-02-17T10:00:00');  // Should send reminders
        
        // Test Slot 3 (25th - 30th)
        await testSlot('2024-02-27T10:00:00');  // Should send reminders
        
        // Test non-payment days
        await testSlot('2024-02-12T10:00:00');  // Should NOT send reminders
        await testSlot('2024-02-22T10:00:00');  // Should NOT send reminders
        
        // Test edge cases
        await testSlot('2024-02-01T00:00:01');  // First day of slot 1
        await testSlot('2024-02-05T23:59:59');  // Last day of slot 1
        await testSlot('2024-02-15T00:00:01');  // First day of slot 2
        await testSlot('2024-02-20T23:59:59');  // Last day of slot 2
        await testSlot('2024-02-25T00:00:01');  // First day of slot 3
        await testSlot('2024-02-29T23:59:59');  // Last day of slot 3 (leap year)

        console.log('\nAll tests completed!');
        await mongoose.connection.close();
        
    } catch (error) {
        console.error('Test setup failed:', error);
    }
};

// Run all tests
runTests();
