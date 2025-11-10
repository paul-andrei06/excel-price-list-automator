import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { PriceList, ProductData } from "@/components/PriceList";
import { TradePriceList, TradeProductData } from "@/components/TradePriceList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { FileSpreadsheet } from "lucide-react";

const Index = () => {
  const [priceData, setPriceData] = useState<ProductData[] | null>(null);
  const [tradeData, setTradeData] = useState<TradeProductData[] | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // Look for Raw_Data sheet or Raw_Data (2) sheet
      const sheetName = workbook.SheetNames.find(
        (name) => name === "Raw_Data" || name === "Raw_Data (2)"
      ) || workbook.SheetNames[0];
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);
      
      // Map and validate the data for Wholesale
      const mappedData: ProductData[] = jsonData
        .filter((row) => row.SKU && row.Category && row.Brand)
        .map((row) => ({
          Category: row.Category || "",
          Brand: row.Brand || "",
          SKU: row.SKU || "",
          "Product Name": row["Product Name"] || "",
          Wholesale: parseFloat(row.Wholesale) || 0,
          "Trade £": parseFloat(row["Trade £"]) || 0,
          "(Box) Ctn": row["(Box) Ctn"] || "",
        }));

      // Map data for Trade Price List
      const mappedTradeData: TradeProductData[] = jsonData
        .filter((row) => row.SKU && row.Category && row.Brand)
        .map((row) => ({
          Category: row.Category || "",
          Brand: row.Brand || "",
          SKU: row.SKU || "",
          "Product Name": row["Product Name"] || "",
          "Trade £": parseFloat(row["Trade £"]) || 0,
          "(Box) Ctn": row["(Box) Ctn"] || "",
        }));

      if (mappedData.length === 0) {
        toast({
          title: "No valid data found",
          description: "Make sure your Excel file contains the required columns",
          variant: "destructive",
        });
        return;
      }

      setPriceData(mappedData);
      setTradeData(mappedTradeData);
      toast({
        title: "File processed successfully",
        description: `Loaded ${mappedData.length} products`,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error processing file",
        description: "Please check your Excel file format and try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card print:hidden">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Wholesale Price List Generator
              </h1>
              <p className="text-sm text-muted-foreground">
                Transform your Excel data into formatted price lists
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!priceData ? (
          <div className="max-w-2xl mx-auto">
            <FileUpload onFileSelect={handleFileSelect} />
            
            <div className="mt-8 p-6 bg-card rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-3">Required Excel Columns:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Category</li>
                <li>• Brand</li>
                <li>• SKU</li>
                <li>• Product Name</li>
                <li>• Wholesale</li>
                <li>• Trade £</li>
                <li>• (Box) Ctn</li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                Upload your Raw_Data or Raw_Data (2) sheet and we'll automatically format it
              </p>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="wholesale" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 print:hidden">
              <TabsTrigger value="wholesale">Wholesale Price List</TabsTrigger>
              <TabsTrigger value="trade">Trade Price List</TabsTrigger>
            </TabsList>
            <TabsContent value="wholesale">
              <PriceList data={priceData} />
            </TabsContent>
            <TabsContent value="trade">
              {tradeData && <TradePriceList data={tradeData} />}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
