import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function DocumentsList({ requestId }) {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    if (!requestId) return;
    const token = localStorage.getItem('token');
    axios.get(`/documents/request/${requestId}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => setDocs(Array.isArray(r.data) ? r.data : []))
      .catch(() => setDocs([]));
  }, [requestId]);

  if (!docs || docs.length === 0) return <p className="text-sm text-gray-500">No attachments</p>;

  return (
    <ul className="list-disc pl-5">
      {docs.map(d => (
        <li key={d.document_id}>
          <a className="text-sm text-blue-600 hover:underline" href={(d.file_path && d.file_path.startsWith('/')) ? d.file_path : `/uploads/${d.file_path.split('/').slice(-1)[0]}`} target="_blank" rel="noreferrer">{d.file_name}</a>
        </li>
      ))}
    </ul>
  );
}
