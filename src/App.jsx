import {useEffect, useState} from 'react';
import './App.css';
import {Button, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography} from "@mui/material";

function App() {
  const [deals, setDeals] = useState([]);
  const [postalCode, setPostalCode] = useState("92129");
  const [nameFilter, setNameFilter] = useState("");

  const FLIPP_ENDPOINT = "https://backflipp.wishabi.com/flipp/items/search";

  useEffect(() => {
    // get the postal code from url, or use default
    const queryParams = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    if (queryParams["postalCode"]) {
      setPostalCode(queryParams["postalCode"]);
    }
  });

  const fetchDeals = async () => {
    const STORES = ["ralphs", "vons", "sprouts", "final", "food", "stater"];
    let tempDeals = [];
    for (const store of STORES) {
      const res = await fetch(`${FLIPP_ENDPOINT}?locale=en&postal_code=${postalCode}&q=${store}`);
      if (res.ok) {
        const data = await res.json();
        tempDeals = tempDeals.concat(data["items"]);
        setDeals(tempDeals);
      }
      else {
        console.error(`problem fetching data for store=${store}`);
      }
    }
    console.log(tempDeals);
  }

  return (
      <div className="App">
        <Typography variant="h2">Grocery Deals</Typography>
        <hr />
        <Typography variant="h6">Your area: {postalCode}</Typography>
        <Button onClick={fetchDeals} variant="outlined" sx={{width: "100%"}}>Go!</Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Store</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Category</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell></TableCell>
              <TableCell><TextField value={nameFilter} onChange={event => setNameFilter(event.target.value)} placeholder="filter"></TextField></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
            {deals && deals.filter(x => x.item_weight > 0 && x._L2 === "Food Items" && x.current_price && (!nameFilter || x.name.toLowerCase().includes(nameFilter))).map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{`${item["merchant_name"]}`}</TableCell>
                  <TableCell>{item["name"]}</TableCell>
                  <TableCell>{`${item["pre_price_text"] ? `${item["pre_price_text"]} ` : ""}`}
                    <b>${item["current_price"]}</b>
                    {item["post_price_text"]}
                  </TableCell>
                  <TableCell>{item["_L2"]}</TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  )
}

export default App;
