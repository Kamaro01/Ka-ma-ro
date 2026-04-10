import React from 'react';

interface ShippingRate {
  region: string;
  standardTime: string;
  standardCost: string;
  expressTime: string;
  expressCost: string;
}

interface ShippingTableProps {
  rates: ShippingRate[];
}

const ShippingTable = ({ rates }: ShippingTableProps) => {
  return (
    <div className="overflow-x-auto mb-8">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden elevation-1 rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left caption font-semibold text-foreground uppercase tracking-wider">
                  Region
                </th>
                <th className="px-4 py-3 text-left caption font-semibold text-foreground uppercase tracking-wider">
                  Standard Delivery
                </th>
                <th className="px-4 py-3 text-left caption font-semibold text-foreground uppercase tracking-wider">
                  Standard Cost
                </th>
                <th className="px-4 py-3 text-left caption font-semibold text-foreground uppercase tracking-wider">
                  Express Delivery
                </th>
                <th className="px-4 py-3 text-left caption font-semibold text-foreground uppercase tracking-wider">
                  Express Cost
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {rates.map((rate, index) => (
                <tr key={index} className="hover:bg-muted/50 transition-smooth">
                  <td className="px-4 py-4 whitespace-nowrap font-medium text-foreground">
                    {rate.region}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-foreground/80">
                    {rate.standardTime}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap font-data text-foreground">
                    {rate.standardCost}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-foreground/80">
                    {rate.expressTime}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap font-data text-foreground">
                    {rate.expressCost}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShippingTable;
