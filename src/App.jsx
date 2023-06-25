import {useEffect, useState} from 'react';
import './App.css';
import {
  Accordion, AccordionDetails, AccordionSummary,
  Box,
  Button,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function App() {
  const [deals, setDeals] = useState([]);
  const [postalCode, setPostalCode] = useState("92128");
  const [nameFilter, setNameFilter] = useState("");
  const [stores, setStores] = useState(["ralphs", "vons", "sprouts", "stater"]); // "final", "food",)

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
    let tempDeals = [];
    for (const store of stores) {
      const res = await fetch(`${FLIPP_ENDPOINT}?locale=en&postal_code=${postalCode}&q=${store}`);
      if (res.ok) {
        const data = await res.json();
        tempDeals = tempDeals.concat(data["items"]);
        setDeals(tempDeals);
        console.log(`example from ${store}:`, data["items"][0]);
      }
      else {
        console.error(`problem fetching data for store=${store}`);
      }
    }
    console.log(tempDeals);
  }

  const compareByItemWeight = (a, b) => {
    if (a["item_weight"] < b["item_weight"]) {
      return 1;
    }
    else if (a["item_weight"] > b["item_weight"]) {
      return -1;
    }
    return 0;
  }

  return (
      <div className="App">
        <Typography variant="h2">Grocery Deals</Typography>
        <hr />
        <Typography variant="h6">Your area: {postalCode}</Typography>
        <Button onClick={fetchDeals} variant="outlined" sx={{width: "100%"}}>Go!</Button>

        <Box sx={{display: "flex"}}>
          {deals && stores.map(store => (
              <Box sx={{borderColor: "gray", borderWidth: "1px", borderStyle: "solid", margin: "8px"}}>
                <h2>{store.toUpperCase()}</h2>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {deals.filter(x => x.merchant_name.toUpperCase().includes(store.toUpperCase()) && x.item_weight > 1 && x._L2 === "Food Items" && x.current_price && (!nameFilter || x.name.toLowerCase().includes(nameFilter))).sort(compareByItemWeight).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item["name"]}</TableCell>
                          <TableCell>{`${item["pre_price_text"] ? `${item["pre_price_text"]} ` : ""}`}
                            <b>${item["current_price"]}</b>
                            {item["post_price_text"]}
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
          ))}
        </Box>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} >
            <h2>Combined Table</h2>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Store</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Weight</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow> {/* filter row */}
                  <TableCell></TableCell>
                  <TableCell><TextField value={nameFilter} onChange={event => setNameFilter(event.target.value)} placeholder="filter"></TextField></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                </TableRow>
                {deals && deals.filter(x => x.item_weight > 0 && x._L2 === "Food Items" && x.current_price && (!nameFilter || x.name.toLowerCase().includes(nameFilter))).sort(compareByItemWeight).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{`${item["merchant_name"]}`}</TableCell>
                      <TableCell>{item["name"]}</TableCell>
                      <TableCell>{`${item["pre_price_text"] ? `${item["pre_price_text"]} ` : ""}`}
                        <b>${item["current_price"]}</b>
                        {item["post_price_text"]}
                      </TableCell>
                      <TableCell>{item["_L2"]}</TableCell>
                      <TableCell>{item["item_weight"]}</TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>

      </div>
  )
}

export default App;
