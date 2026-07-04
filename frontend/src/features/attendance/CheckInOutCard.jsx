import React, { useState, useEffect } from 'react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Clock, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { formatToTime } from '../../utils/dateHelpers';

export default function CheckInOutCard({ todayRecord, onCheckIn, onCheckOut, actionLoading }) {
  const [time, setTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatClockTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDateString = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const isCheckedIn = !!todayRecord;
  const isCheckedOut = isCheckedIn && !!todayRecord.checkOut;

  let buttonText = 'Check In';
  let buttonIcon = LogIn;
  let buttonVariant = 'primary';
  let cardStatusText = 'Ready to log your day.';

  if (isCheckedIn && !isCheckedOut) {
    buttonText = 'Check Out';
    buttonIcon = LogOut;
    buttonVariant = 'danger';
    cardStatusText = `Checked in at ${formatToTime(todayRecord.checkIn)}.`;
  } else if (isCheckedOut) {
    buttonText = 'Completed Today';
    buttonIcon = CheckCircle2;
    buttonVariant = 'success';
    cardStatusText = 'You have logged out. Have a great evening!';
  }

  const handleAction = () => {
    if (!isCheckedIn) {
      onCheckIn();
    } else if (!isCheckedOut) {
      onCheckOut();
    }
  };

  return (
    <Card className="border-primary-100 shadow-md">
      <CardHeader className="bg-neutral-50/50 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-neutral-800">Punch Clock</CardTitle>
            <CardDescription>{formatDateString(time)}</CardDescription>
          </div>
          <Clock className="w-5 h-5 text-primary-500 animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="py-6 flex flex-col items-center justify-center space-y-6">
        {/* Digital Clock Display */}
        <div className="text-center">
          <span className="text-3xl md:text-4xl font-black text-neutral-800 tracking-wider">
            {formatClockTime(time)}
          </span>
          <span className="block text-[10px] text-neutral-400 font-semibold tracking-wider mt-1.5 uppercase">
            {cardStatusText}
          </span>
        </div>

        {/* Big Interactive Button */}
        <Button
          onClick={handleAction}
          loading={actionLoading}
          disabled={isCheckedOut || actionLoading}
          variant={buttonVariant}
          size="lg"
          className="w-full sm:w-64 font-bold text-sm py-3 transition-transform duration-200 active:scale-95 shadow-lg"
          icon={buttonIcon}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
}
