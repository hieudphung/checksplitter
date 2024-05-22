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
    newItems[index] = { ...newItems[index], [field]: event.target.value };
    setItems(newItems);
  };

  const handleNameClick = (itemIndex, nameIndex) => {
    const newItems = items.map((item, idx) => {
      if (idx === itemIndex) {
        const selected = item.selected.includes(nameIndex)
          ? item.selected.filter(index => index !== nameIndex)
          : [...item.selected, nameIndex];

        const subtotal = calculateSubtotal(item.price, selected.length);
        return { ...item, selected, subtotal };
      }
      return item;
    });

    setItems(newItems);
  };

  const handleToggleAllClick = (itemIndex) => {
    const item = items[itemIndex];
    const allSelected = item.selected.length === names.length;

    const selected = allSelected ? [] : names.map((_, index) => index);
    const subtotal = calculateSubtotal(item.price, selected.length);

    const newItems = items.map((item, idx) => {
      if (idx === itemIndex) {
        return { ...item, selected, subtotal };
      }
      return item;
    });

    setItems(newItems);
  };

  const calculateSubtotal = (price, numberOfSelected) => {
    const originalPrice = parseFloat(price);

    if (isNaN(originalPrice) || !isFinite(originalPrice) || originalPrice === 0) {
      return '-';
    }

    return numberOfSelected === 0 ? originalPrice : (originalPrice / numberOfSelected);
  };

  const handleAddName = () => {
    setNames([...names, '']);
    setTimeout(() => {
      inputRefs.current[inputRefs.current.length - 1].focus();
    }, 0);
  };

  const handleRemoveName = (index) => {
    const newNames = names.filter((_, i) => i !== index);
    setNames(newNames);
    const newItems = items.map(item => ({
      ...item,
      selected: item.selected.filter((_, i) => i !== index),
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
      items.reduce((sum, item) => {
        if (item.selected.includes(nameIndex)) {
          const itemShare = parseFloat(item.price) / item.selected.length;
          return sum + itemShare;
        }
        return sum;
      }, 0)
    );

    const taxAmount = subtotals.map(subtotal => subtotal * (parseFloat(tax) / 100 || 0));
    const subtotalPlusTax = subtotals.map((subtotal, index) => subtotal + taxAmount[index]); // Calculate subtotal + tax

    const tipAmount = subtotalPlusTax.map(subtotal => subtotal * (parseFloat(tip) / 100 || 0)); // Tip based on subtotal + tax

    const totals = subtotals.map((subtotal, index) => subtotal + taxAmount[index] + tipAmount[index]);

    return { subtotals, taxAmount, tipAmount, totals };
  };

const { subtotals, taxAmount, tipAmount, totals } = calculateTotals();



  return (
    <div>
      <h2>Bill Splitter / Check Divider</h2>

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
              placeholder="Item Name (opt.)"
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
            <button onClick={() => handleToggleAllClick(itemIndex)}>Toggle All</button>
            <button onClick={() => handleRemoveItem(itemIndex)}>Remove Item</button>
          </div>
        ))}
        <button className="button" onClick={handleAddItem}>Add Item</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div>
          <h3>Tax and Tip</h3>
          <label style={{ marginRight: '10px' }}>Tax Percentage:</label>
          <input
            type="number"
            placeholder="Tax %"
            value={tax}
            onChange={e => setTax(e.target.value)}
          />
          <div>
          <label style={{ marginRight: '10px' }}>Tip Percentage:</label>
          <input
            type="number"
            placeholder="Tip %"
            value={tip}
            onChange={e => setTip(e.target.value)}
          />
          </div>
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
      <div>
      <h2>Extra Information</h2>
      <h3>How to Use</h3>
      <h4>This is meant for one person paying the entire tab then splitting up the order to find the total payment owed.</h4>
      <h4>By clicking a name for each item, the calculator automatically splits the bill per person including tax and tip (if applicable). (Tax and tip are proportionally calculated.)</h4>
      <h4>If you would like to split items among certain people or everyone, simply click the names that correspond to each person and what they have ordered or click toggle all to share among everyone.</h4>
      <h4>Green boxes are selected where as red boxes are not selected in the calculation for that item.</h4>
      <h3>Subtotal vs Total</h3>
      <h4>If there is no tax/tip involved, then the subtotal will be the same as the total; however if there is tax/tip included the subtotal is the total before adding the tax/tip. Then the total will be the grand amount the person is paying.</h4>
      <h3>Export</h3>
      <h4>When clicking export, a link will be copied to the clipboard that is able to be send to others to check calculations, to see totals, etc.</h4>
      <h3>Dark and Light Mode</h3>
      <h4>Clicking the icon at the top right will toggle dark/light mode.</h4>
      </div>
    </div>
  );
};

export default BillSplitter;