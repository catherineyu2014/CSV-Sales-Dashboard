
/*

@author Catherine Yu
Arpari Technical Project - Sales Dashboard
October 30, 2025

*/

import React, { useState } from "react";
import Papa from "papaparse";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, 
} from "recharts";
import "./App.css";

function App() {
  // define state hooks
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalQuantity: 0,
    transactions: 0,
  });
  const [revenueByProduct, setRevenueByProduct] = useState([]);
  

  const requiredColumns = ["date", "product", "quantity", "revenue"];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    // error: no file found
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    // error: not a .csv file
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      setError("Invalid file type. Please upload a CSV file.");
      return;
    }

    setError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const firstRow = results.data[0];
        const columns = Object.keys(firstRow || {});

        // error: incorrect columns
        const missing = requiredColumns.filter(
          (col) => !columns.includes(col)
        );

        if (missing.length > 0) {
          setError(
            `CSV is missing required columns: ${missing.join(", ")}`
          );
          setData([]);
          setStats({ totalRevenue: 0, totalQuantity: 0, transactions: 0 });
          setRevenueByProduct([]);
          return;
        }

        // compute stats
        const parsedData = results.data.map((row) => ({
          ...row,
          quantity: parseFloat(row.quantity) || 0,
          revenue: parseFloat(row.revenue) || 0,
        }));

        const totalRevenue = parsedData.reduce( (sum, row) => sum + row.revenue, 0);
        const totalQuantity = parsedData.reduce( (sum, row) => sum + row.quantity, 0 );

        setData(parsedData);
        setStats({
          totalRevenue,
          totalQuantity,
          transactions: parsedData.length,
        });

        // rev by product calculations
        const aggregated = Object.values(
          parsedData.reduce((acc,row)=>{
            if (!acc[row.product]) acc[row.product] = {product:row.product, revenue:0};
            acc[row.product].revenue += row.revenue;
            return acc;
          },{})
        );
        setRevenueByProduct(aggregated);
      },
      error: () => {
        setError("Error reading the CSV file. Please try again.");
      },
    });
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Arpari CSV Data Dashboard</h1>
      <p>Upload a CSV file with sales data: date, product, quantity, revenue</p>

      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {/* error handling */}
      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#ffe6e6",
            color: "#b30000",
            borderRadius: "6px",
            width: "fit-content",
          }}
        >
          {error}
        </div>
      )}

      {/* display table */}
      {data.length > 0 && (
        <>
        <h3>Sales Data</h3>
          <table
            border="1"
            cellPadding="6"
            style={{
              marginTop: "20px",
              borderCollapse: "collapse",
              minWidth: "400px",
            }}
          >
            <thead>
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th key={key}
                    style={{
                      fontFamily: 'Antebas, sans-serif',
                      fontWeight: 700,        
                      textTransform: 'capitalize',    
                    }}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* summary stats */}
          <div>
            <h3>Statistics</h3>
            <div style={{ marginLeft: "30px" }}>
              <p>
                <t><strong>Total Revenue:</strong> </t>${stats.totalRevenue.toFixed(2)}
              </p>
              <p>
                <strong>Total Quantity Sold:</strong> {stats.totalQuantity}
              </p>
              <p>
                <strong>Number of Transactions:</strong> {stats.transactions}
              </p>
            </div>
          </div>
          
          {/* revenue by product chart */}
          <div style={{ marginTop: "30px" }}>
            <h3>Revenue by Product</h3>
            <BarChart width={600} height={400} data={revenueByProduct}>
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toFixed(2)}`} />
              <Bar dataKey="revenue" fill="#002179" />
            </BarChart>
          </div>


        </>

      )}
    </div>
  );
}

export default App;
