//Helper function to calculate final ticket value
function calculateTicketValue(ticketData: any): number {
  const price = ticketData.price || 0;
  const fee = ticketData.fee || 0;
  return parseFloat((price + fee).toFixed(2)); // Ensure proper decimal format
}

export default calculateTicketValue;
