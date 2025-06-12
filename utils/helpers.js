export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const generateDummyCSV = (tickets) => {
  const headers = ['Ticket Number,ID,Title,Status,Priority,Company,Created At'];
  const rows = tickets.map(ticket => 
    `${ticket.ticketNumber},${ticket.id},${ticket.title},${ticket.status},${ticket.priority},${ticket.company.name},${ticket.createdAt}`
  );
  return [...headers, ...rows].join('\n');
};

export const downloadFile = (content, fileName, contentType) => {
  const a = document.createElement('a');
  const file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

export const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};