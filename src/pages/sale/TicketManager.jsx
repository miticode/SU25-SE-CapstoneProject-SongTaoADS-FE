import React, { useState } from "react";
import TicketList from "../../components/Ticket/TicketList";
import TicketDetailDialog from "../../components/Ticket/TicketDetailDialog";

const TicketManager = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [open, setOpen] = useState(false);

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTicket(null);
  };

  return (
    <div>
      <TicketList onView={handleView} />
      <TicketDetailDialog
        open={open}
        ticket={selectedTicket}
        onClose={handleClose}
      />
    </div>
  );
};

export default TicketManager;
