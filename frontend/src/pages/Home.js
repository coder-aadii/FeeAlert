import React from 'react';
import EmailReminderForm from '../components/EmailReminderForm';
import SMSReminderForm from '../components/SMSReminderForm';
import Navbar from '../components/Navbar';

const Home = () => {

  return (
    <div>
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center mb-8">Reminder System</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Email Reminder</h2>
            <EmailReminderForm />
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">SMS Reminder</h2>
            <SMSReminderForm />
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-100 mt-8">
          <div className="container mx-auto px-4 py-4 text-center text-gray-600">
            <p>© 2024 FeeAlert - Monitor fees efficiently</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
