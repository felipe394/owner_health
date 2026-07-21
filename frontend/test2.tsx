import React from 'react';
const Test = () => {
  const requests: any[] = [];
  return (
    <div>
      {requests.filter(r => r.status === 'concluido').length === 0 ? (
        <div>A</div>
      ) : (
        <div>
          {requests.filter(r => r.status === 'concluido').map((r: any, ri: number) => (
            <div key={ri}>
              <button onClick={() => {}}>B</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
