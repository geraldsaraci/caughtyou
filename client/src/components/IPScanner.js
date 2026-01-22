import React, { useState } from 'react';

const IPScanner = () => {
  const [ip, setIp] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async () => {
    if (!ip.trim()) {
      setError('Please enter an IP address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/scan/ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: ip.trim() })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Scan failed');
      }
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getThreatClass = (level) => `threat-${level.toLowerCase()}`;
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleScan(); };

  return (
    <div>
      <div className="scanner-section">
        <h2 className="section-title">⚡ IP THREAT SCANNER</h2>
        <div className="input-group">
          <input type="text" placeholder="Enter IP address (e.g., 1.1.1.1)" value={ip} onChange={(e) => setIp(e.target.value)} onKeyPress={handleKeyPress} />
          <button className={`neon-button ${loading ? 'loading' : ''}`} onClick={handleScan} disabled={loading}>
            {loading ? <>SCANNING...</> : 'SCAN IP'}
          </button>
        </div>
        {error && <div className="error-message">⚠️ {error}</div>}
      </div>
      {results && (
        <div className="results-section">
          <h2 className="section-title">📊 SCAN RESULTS</h2>
          <table>
            <thead><tr><th>Property</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td>IP Address</td><td><strong>{results.ip}</strong></td></tr>
              <tr><td>Country</td><td>{results.country}</td></tr>
              <tr><td>ASN</td><td>{results.asn}</td></tr>
              <tr><td>Organization</td><td>{results.organization}</td></tr>
              <tr><td>Threat Level</td><td><span className={getThreatClass(results.threat_level)}>{results.threat_level}</span></td></tr>
              <tr><td>Malicious Reports</td><td><strong style={{ color: results.malicious_count > 0 ? '#ff1744' : '#00ff88' }}>{results.malicious_count}</strong></td></tr>
              <tr><td>Suspicious Reports</td><td>{results.suspicious_count}</td></tr>
              <tr><td>Undetected</td><td>{results.undetected_count}</td></tr>
              <tr><td>Harmless</td><td>{results.harmless_count}</td></tr>
              <tr><td>VPN</td><td><span className={results.is_vpn ? 'bool-true' : 'bool-false'}>{results.is_vpn ? '✓ YES' : '✗ NO'}</span></td></tr>
              <tr><td>Proxy</td><td><span className={results.is_proxy ? 'bool-true' : 'bool-false'}>{results.is_proxy ? '✓ YES' : '✗ NO'}</span></td></tr>
              <tr><td>Tor</td><td><span className={results.is_tor ? 'bool-true' : 'bool-false'}>{results.is_tor ? '✓ YES' : '✗ NO'}</span></td></tr>
              <tr><td>Data Center</td><td><span className={results.is_datacenter ? 'bool-true' : 'bool-false'}>{results.is_datacenter ? '✓ YES' : '✗ NO'}</span></td></tr>
              <tr><td>Last Scan Date</td><td>{results.last_analysis_date}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IPScanner;
