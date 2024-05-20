
import React, { useState } from 'react';
import currency from 'currency.js';

const CurrencyExchange = () => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [exchangeRate, setExchangeRate] = useState(0.84); // Example exchange rate, you may want to fetch this from an API

  const handleConversion = () => {
    const amountWithTax = currency(amount).multiply(1 + parseFloat(taxRate) / 100);
    const result = amountWithTax.multiply(exchangeRate);
    setConvertedAmount(result.format());
  };

  return (
    <div>
      <h2>Currency Exchange</h2>
      <div>
        <label>Person's Name:</label>
        <input 
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
        />
      </div>
      <div>
        <label>Amount:</label>
        <input 
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
        />
      </div>
      <div>
        <label>Tax Rate (%):</label>
        <input 
          type="text"
          value={taxRate}
          onChange={(e) => setTaxRate(e.target.value)}
          placeholder="Tax Rate"
        />
      </div>
      <div>
        <label>From Currency:</label>
        <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)}>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          {/* Add more currencies as needed */}
        </select>
      </div>
      <div>
        <label>To Currency:</label>
        <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)}>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="JPY">JPY</option>
          {/* Add more currencies as needed */}
        </select>
      </div>
      <button onClick={handleConversion}>Convert</button>
      {convertedAmount && (
        <p>
          {name}, the converted amount is: {convertedAmount} {toCurrency}
        </p>
      )}
    </div>
  );
};

export default CurrencyExchange;
