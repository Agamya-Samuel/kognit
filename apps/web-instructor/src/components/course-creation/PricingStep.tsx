import { CardContent, CardHeader, CardTitle } from '@edutech/ui';
import { Input } from '@edutech/ui';
import { Label } from '@edutech/ui';
import { Badge } from '@edutech/ui';

interface PricingStepProps {
  data: {
    pricingType: 'free' | 'paid';
    priceInr: number;
  };
  onChange: (data: any) => void;
}

export function PricingStep({ data, onChange }: PricingStepProps) {
  const handlePricingTypeChange = (pricingType: 'free' | 'paid') => {
    onChange({ ...data, pricingType, priceInr: pricingType === 'free' ? 0 : data.priceInr });
  };

  const handlePriceChange = (priceInr: number) => {
    onChange({ ...data, priceInr });
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Course Pricing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose a pricing model for your course. You can change this later.
        </p>

        <div className="space-y-4">
          <Label>Pricing Type</Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handlePricingTypeChange('free')}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-colors ${
                data.pricingType === 'free'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              {data.pricingType === 'free' && (
                <Badge className="absolute -top-2 -right-2">Selected</Badge>
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Free</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Students can access for free
              </p>
            </button>

            <button
              type="button"
              onClick={() => handlePricingTypeChange('paid')}
              className={`relative flex flex-col items-center justify-center rounded-lg border-2 p-6 transition-colors ${
                data.pricingType === 'paid'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              {data.pricingType === 'paid' && (
                <Badge className="absolute -top-2 -right-2">Selected</Badge>
              )}
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Paid</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Set a price for your course
              </p>
            </button>
          </div>
        </div>

        {data.pricingType === 'paid' && (
          <div className="space-y-2">
            <Label htmlFor="price">Price (INR) *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                ₹
              </span>
              <Input
                id="price"
                type="number"
                min="99"
                step="1"
                value={data.priceInr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handlePriceChange(Number(e.target.value))
                }
                placeholder="4999"
                className="pl-8"
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Minimum price: ₹99. This amount is exclusive of taxes.
            </p>
          </div>
        )}

        {data.pricingType === 'free' && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> Free courses help build your student base and can be
              upgraded to paid later if you wish.
            </p>
          </div>
        )}
      </CardContent>
    </>
  );
}
