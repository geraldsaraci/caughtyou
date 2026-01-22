const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/build')));

const VT_API_KEY = process.env.VT_API_KEY || '8707b470e4cac71258da3e21c5c9cefe2cec7638c030b11d2ba563486f0964f4';

app.post('/api/scan/ip', async (req, res) => {
  try {
    const { ip } = req.body;
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) {
      return res.status(400).json({ error: 'Invalid IP address format' });
    }

    const vtResponse = await axios.get(`https://www.virustotal.com/api/v3/ip_addresses/${ip}`, {
      headers: { 'x-apikey': VT_API_KEY }
    });

    const data = vtResponse.data.data.attributes;
    const result = {
      ip: ip,
      country: data.country || 'N/A',
      asn: data.asn || 'N/A',
      organization: data.as_owner || 'N/A',
      is_vpn: data.is_vpn || false,
      is_proxy: data.is_proxy || false,
      is_tor: data.is_tor || false,
      is_datacenter: data.is_datacenter || false,
      malicious_count: data.last_analysis_stats?.malicious || 0,
      suspicious_count: data.last_analysis_stats?.suspicious || 0,
      undetected_count: data.last_analysis_stats?.undetected || 0,
      harmless_count: data.last_analysis_stats?.harmless || 0,
      last_analysis_date: data.last_analysis_date || 'N/A',
      threat_level: (data.last_analysis_stats?.malicious || 0) > 5 ? 'CRITICAL' : 
                    (data.last_analysis_stats?.malicious || 0) > 2 ? 'HIGH' : 
                    (data.last_analysis_stats?.suspicious || 0) > 0 ? 'MEDIUM' : 'LOW'
    };

    res.json(result);
  } catch (error) {
    console.error('IP scan error:', error.message);
    res.status(500).json({ error: 'Failed to scan IP', details: error.response?.data?.error?.message || error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'caughtyou SOC infra OK', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🛡️ SOC Defensive Web App running on port ${PORT}`);
});
