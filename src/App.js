import "./App.css";
// import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { useState, useEffect } from "react";
import { Grid } from "react-loader-spinner";
import axios from "axios";
import React from "react";
function App() {
  const [file, setFile] = useState();
  const [filePreview, setFilePreview] = useState();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState();
  const [confirmedResult, setConfirmedResult] = useState();
  const [displayTable, setDisplayTable] = useState();
  const url =
    "https://app.nanonets.com/api/v2/OCR/Model/30e4ad4c-6e87-49d7-933e-7e3befb5f59f/LabelFile/";
  const formData = new FormData();
  const tableArray = [];
  formData.append("file", file);

  useEffect(() => {
    if (result != null) {
      // sorting into rows tableArray[0] - row 1 , tableArray[1] - row 2 etc..
      result.map((res) => {
        let table = res.cells;
        let rows = table[table.length - 1].row;
        let tempArray = [];
        console.log(rows);
        for (let i = 1; i <= rows; i++) {
          tempArray[i - 1] = table.filter((cell) => cell.row === i);
        }
        tableArray.push(tempArray);
      });
      console.log(tableArray);
      setDisplayTable(tableArray);
    }
  }, [result]);

  const onFileChange = (e) => {
    setFilePreview(URL.createObjectURL(e.target.files[0]));
    setFile(e.target.files[0]);
  };

  const handleChange = (e, tableIndex, rowIndex, colIndex) => {
    console.log(e);
    console.log(e.target.value);
    setDisplayTable(
      [...displayTable],
      (displayTable[tableIndex][rowIndex][colIndex] = {
        ...displayTable[tableIndex][rowIndex][colIndex],
        text: e.target.value,
      })
    );
    console.log(displayTable);
  };
  const handleConfirm = () => {
    console.log(displayTable);
  };

  const extractText = async () => {
    setLoading(true);
    axios
      .post(url, formData, {
        auth: {
          username: `${process.env.REACT_APP_API_KEY}`,
        },
      })
      .then((response) => {
        setLoading(false);
        console.log(response);
        console.log(response.data.result[0].prediction[0].cells);
        setResult(response.data.result[0].prediction);
      })

      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="App">
      <div className="appContainer">
        <div className="statusContainer">
          <h3>OCR Web-app powered by Nanonets </h3>

          <input
            type="file"
            onChange={onFileChange}
            style={{ marginTop: "2rem" }}
          />

          <input
            type="button"
            value="Upload"
            onClick={extractText}
            style={{ marginTop: "2rem" }}
          />

          <div
            style={{
              marginTop: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div>
              {loading && <Grid color="#00BFFF" height={80} width={80} />}
            </div>
          </div>

          {file && (
            <div className="imageContainer">
              <div className="sectionContainer">
                <h3>Upload Preview</h3>

                <img
                  src={filePreview}
                  style={{ width: "100%" }}
                  alt="Upload preview "
                />
              </div>
            </div>
          )}
        </div>

        <div className="resultContainer">
          <h3>Result</h3>

          {displayTable &&
            displayTable.map((table, tableIndex) => (
              <div key={tableIndex} className="tableContainer">
              <table  >
                <tbody>
                  {table.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, colIndex) => (
                        <td key={cell.id}>
                          <input
                            key={cell.id}
                            type="text"
                            className="inputData"
                            name={cell.label}
                            value={cell.text}
                            onChange={(e) =>
                              handleChange(e,tableIndex, rowIndex, colIndex)
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            ))}

          {displayTable && (
            <button
              onClick={handleConfirm}
              style={{ margin: "40px 10px", padding: "15px 10px" }}
            >
              Confirm & Proceed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
