import React, { useState, useRef, useEffect } from 'react';

const BillSplitter = () => {
  const [names, setNames] = useState(['']);
  const [items, setItems] = useState([{ name: '', price: '', selected: [], subtotal: 0 }]);
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const data = queryParams.get('data');
    if (data) {
      const parsedData = JSON.parse(decodeURIComponent(data));
      setNames(parsedData.names);
      setItems(parsedData.items);
      setTax(parsedData.tax);
      setTip(parsedData.tip);
    }
  }, []);

  const handleNameChange = (index, event) => {
    const newNames = [...names];
    newNames[index] = event.target.value;
    setNames(newNames);
  };

  const handleItemChange = (index, field, event) => {
    const newItems = [...items];
    newItems[index][field] = event.target.value;
    setItems(newItems);
  };

  const handleNameClick = (itemIndex, nameIndex) => {
    const newItems = [...items];
    const item = newItems[itemIndex];
    const selected = item.selected;

    if (selected.includes(nameIndex)) {
      selected.splice(selected.indexOf(nameIndex), 1);
    } else {
      selected.push(nameIndex);
    }

    item.selected = selected;

    const subtotal = calculateSubtotal(itemIndex);
    item.subtotal = subtotal;

    newItems[itemIndex] = item;
    setItems(newItems);
  };

  const calculateSubtotal = (itemIndex) => {
    const item = items[itemIndex];
    const numberOfSelected = item.selected.length;
    const originalPrice = parseFloat(item.price);
  
    if (isNaN(originalPrice) || !isFinite(originalPrice) || originalPrice === 0) {
      return '-';
    }
  
    return numberOfSelected === 0 ? originalPrice : (originalPrice / numberOfSelected);
  };
  
  


  const handleAddName = () => {
    setNames([...names, '']);
    const newItems = items.map(item => ({ ...item, selected: [...item.selected, false] }));
    setItems(newItems);
    setTimeout(() => {
      inputRefs.current[inputRefs.current.length - 1].focus();
    }, 0);
  };

  const handleRemoveName = (index) => {
    const newNames = names.filter((_, i) => i !== index);
    setNames(newNames);
    const newItems = items.map(item => ({
      ...item,
      selected: item.selected.filter((_, i) => i !== index)
    }));
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { name: '', price: '', selected: [], subtotal: 0 }]);
    setTimeout(() => {
      inputRefs.current[inputRefs.current.length - 1].focus();
    }, 0);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleClearAll = () => {
    setNames(['']);
    setItems([{ name: '', price: '', selected: [], subtotal: 0 }]);
    setTax('');
    setTip('');
  };

  const handleKeyPress = (event, action) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      action();
    }
  };

  const handleExport = () => {
    const data = prepareDataForExport();
    const url = new URL(window.location.href);
    url.searchParams.set('data', data);
    navigator.clipboard.writeText(url.href).then(() => {
      alert('URL copied to clipboard');
    }).catch((error) => {
      console.error('Failed to copy URL: ', error);
    });
  };

  const prepareDataForExport = () => {
    const data = {
      names,
      items,
      tax,
      tip,
    };
    return encodeURIComponent(JSON.stringify(data));
  };

  const calculateTotals = () => {
    const subtotals = names.map((_, nameIndex) =>
      items.reduce((sum, item) => sum + (item.selected.includes(nameIndex) ? item.subtotal : 0), 0)
    );

    const taxAmount = subtotals.map(subtotal => subtotal * (parseFloat(tax) / 100 || 0));
    const tipAmount = subtotals.map(subtotal => subtotal * (parseFloat(tip) / 100 || 0));

    const totals = subtotals.map((subtotal, index) => subtotal + taxAmount[index] + tipAmount[index]);

    return { subtotals, taxAmount, tipAmount, totals };
  };

  const { subtotals, taxAmount, tipAmount, totals } = calculateTotals();

  return (
    <div>
      <h2>Bill Splitter</h2>

      <div>
        <h3>Names</h3>
        {names.map((name, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder={`Name ${index + 1}`}
              value={name}
              onChange={e => handleNameChange(index, e)}
              onKeyPress={e => handleKeyPress(e, handleAddName)}
              ref={el => inputRefs.current[index] = el}
            />
            <button onClick={() => handleRemoveName(index)}>Remove Name</button>
          </div>
        ))}
        <button className="button" onClick={handleAddName}>Add Name</button>
      </div>

      <div>
        <h3>Items</h3>
        {items.map((item, itemIndex) => (
          <div key={itemIndex}>
            <input
              type="text"
              placeholder="Item Name"
              value={item.name}
              onChange={e => handleItemChange(itemIndex, 'name', e)}
              onKeyPress={e => handleKeyPress(e, handleAddItem)}
            />
            <input
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={e => handleItemChange(itemIndex, 'price', e)}
            />
            {names.map((_, nameIndex) => (
              <button
                key={nameIndex}
                style={{ backgroundColor: item.selected.includes(nameIndex) ? 'lightgreen' : 'lightcoral' }}
                onClick={() => handleNameClick(itemIndex, nameIndex)}
              >
                {names[nameIndex]}
              </button>
            ))}
            <button onClick={() => handleRemoveItem(itemIndex)}>Remove Item</button>
          </div>
        ))}
        <button className="button" onClick={handleAddItem}>Add Item</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div>
          <label style={{ marginRight: '10px' }}>Tax Percentage:</label>
          <input
            type="number"
            placeholder="Tax Percentage"
            value={tax}
            onChange={e => setTax(e.target.value)}
          />
        </div>
        <div>
          <label style={{ marginRight: '10px' }}>Tip Percentage:</label>
          <input
            type="number"
            placeholder="Tip Percentage"
            value={tip}
            onChange={e => setTip(e.target.value)}
          />
        </div>
      </div>

      <h3>Totals</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Subtotal</th>
            <th>Tax</th>
            <th>Tip</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name, index) => (
            <tr key={index}>
              <td>{name}</td>
              <td>{subtotals[index].toFixed(2)}</td>
              <td>{taxAmount[index].toFixed(2)}</td>
              <td>{tipAmount[index].toFixed(2)}</td>
              <td>{totals[index].toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <button className="button" onClick={handleClearAll}>Clear All</button>
        <button className="button" onClick={handleExport}>Export</button>
      </div>
    </div>
  );
};

export default BillSplitter;