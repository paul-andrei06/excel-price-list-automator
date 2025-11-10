import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import * as XLSX from "xlsx";

export interface TradeProductData {
  Category: string;
  Brand: string;
  SKU: string;
  "Product Name": string;
  "Trade £": number;
  "(Box) Ctn": string;
}

interface GroupedData {
  [category: string]: {
    [brand: string]: TradeProductData[];
  };
}

interface TradePriceListProps {
  data: TradeProductData[];
}

export const TradePriceList = ({ data }: TradePriceListProps) => {
  const groupedData = data.reduce<GroupedData>((acc, item) => {
    if (!acc[item.Category]) {
      acc[item.Category] = {};
    }
    if (!acc[item.Category][item.Brand]) {
      acc[item.Category][item.Brand] = [];
    }
    acc[item.Category][item.Brand].push(item);
    return acc;
  }, {});

  const handleExport = () => {
    const exportData: any[] = [];
    
    Object.entries(groupedData).forEach(([category, brands]) => {
      exportData.push({
        Category: category,
        Brand: "",
        SKU: "",
        "Product Name": "",
        "Trade £": "",
        "(Box) Ctn": "",
      });
      
      Object.entries(brands).forEach(([brand, products]) => {
        exportData.push({
          Category: "",
          Brand: brand,
          SKU: "",
          "Product Name": "",
          "Trade £": "",
          "(Box) Ctn": "",
        });
        
        products.forEach((product) => {
          exportData.push({
            Category: "",
            Brand: "",
            SKU: product.SKU,
            "Product Name": product["Product Name"],
            "Trade £": product["Trade £"],
            "(Box) Ctn": product["(Box) Ctn"],
          });
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trade Price List");
    XLSX.writeFile(wb, "Trade_Price_List.xlsx");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-foreground">Trade Price List</h2>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleExport} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>
      </div>

      <Card className="p-8">
        <div className="space-y-8">
          {Object.entries(groupedData).map(([category, brands]) => (
            <div key={category} className="space-y-4 print:break-inside-avoid">
              <h3 className="text-xl font-bold text-primary border-b-2 border-primary pb-2">
                {category}
              </h3>
              
              {Object.entries(brands).map(([brand, products]) => (
                <div key={`${category}-${brand}`} className="ml-4 space-y-2">
                  <h4 className="text-lg font-semibold text-accent">
                    {brand}
                  </h4>
                  
                  <div className="ml-6 space-y-1">
                    {products.map((product, idx) => (
                      <div
                        key={`${product.SKU}-${idx}`}
                        className="grid grid-cols-[120px_1fr_100px_100px] gap-4 py-2 border-b border-border last:border-0 text-sm"
                      >
                        <span className="font-mono text-muted-foreground">
                          {product.SKU}
                        </span>
                        <span className="text-foreground">
                          {product["Product Name"]}
                        </span>
                        <span className="text-right font-semibold">
                          £{typeof product["Trade £"] === 'number' ? product["Trade £"].toFixed(2) : product["Trade £"]}
                        </span>
                        <span className="text-right text-muted-foreground">
                          {product["(Box) Ctn"]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
