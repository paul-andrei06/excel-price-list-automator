import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import * as XLSX from "xlsx";

export interface ProductData {
  Category: string;
  Brand: string;
  SKU: string;
  "Product Name": string;
  Wholesale: number;
  "Trade £": number;
  "(Box) Ctn": string;
}

interface GroupedData {
  [brand: string]: {
    [productType: string]: ProductData[];
  };
}

interface PriceListProps {
  data: ProductData[];
}

export const PriceList = ({ data }: PriceListProps) => {
  const groupedData = data.reduce<GroupedData>((acc, item) => {
    if (!acc[item.Brand]) {
      acc[item.Brand] = {};
    }
    if (!acc[item.Brand][item.Category]) {
      acc[item.Brand][item.Category] = [];
    }
    acc[item.Brand][item.Category].push(item);
    return acc;
  }, {});

  const handleExport = () => {
    const exportData: any[] = [];
    
    Object.entries(groupedData).forEach(([brand, productTypes]) => {
      exportData.push({
        Brand: brand,
        "Product Type": "",
        SKU: "",
        "Product Name": "",
        Wholesale: "",
        "Trade £": "",
        "(Box) Ctn": "",
      });
      
      Object.entries(productTypes).forEach(([productType, products]) => {
        exportData.push({
          Brand: "",
          "Product Type": productType,
          SKU: "",
          "Product Name": "",
          Wholesale: "",
          "Trade £": "",
          "(Box) Ctn": "",
        });
        
        products.forEach((product) => {
          exportData.push({
            Brand: "",
            "Product Type": "",
            SKU: product.SKU,
            "Product Name": product["Product Name"],
            Wholesale: product.Wholesale,
            "Trade £": product["Trade £"],
            "(Box) Ctn": product["(Box) Ctn"],
          });
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Wholesale Price List");
    XLSX.writeFile(wb, "Wholesale_Price_List.xlsx");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <h2 className="text-2xl font-bold text-foreground">Wholesale Price List</h2>
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
          {Object.entries(groupedData).map(([brand, productTypes]) => (
            <div key={brand} className="space-y-6 print:break-inside-avoid">
              <h3 className="text-xl font-bold text-primary border-b-2 border-primary pb-2">
                {brand}
              </h3>
              
              {Object.entries(productTypes).map(([productType, products]) => (
                <div key={`${brand}-${productType}`} className="ml-4 space-y-2">
                  <h4 className="text-lg font-semibold text-accent">
                    {productType}
                  </h4>
                  
                  <div className="ml-6 space-y-1">
                    {/* Column Headers */}
                    <div className="grid grid-cols-[120px_1fr_100px_100px_100px] gap-4 py-2 border-b-2 border-primary/50 font-semibold text-sm">
                      <span>SKU</span>
                      <span>Product</span>
                      <span className="text-right">Wholesale</span>
                      <span className="text-right">Trade £</span>
                      <span className="text-right">(Box) Ctn.</span>
                    </div>
                    
                    {products.map((product, idx) => (
                      <div
                        key={`${product.SKU}-${idx}`}
                        className="grid grid-cols-[120px_1fr_100px_100px_100px] gap-4 py-2 border-b border-border last:border-0 text-sm"
                      >
                        <span className="font-mono text-muted-foreground">
                          {product.SKU}
                        </span>
                        <span className="text-foreground">
                          {product["Product Name"]}
                        </span>
                        <span className="text-right font-semibold">
                          £{product.Wholesale.toFixed(2)}
                        </span>
                        <span className="text-right">
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
