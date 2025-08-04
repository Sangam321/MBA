import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, BarChart3, ShoppingCart, Target, TrendingUp } from 'lucide-react';
import React from 'react';

interface Rule {
  antecedents: string[];
  consequents: string[];
  support: number;
  confidence: number;
  lift: number;
}

interface AnalysisData {
  frequent_itemsets: Array<{
    itemset: string[];
    support: number;
  }>;
  association_rules: Rule[];
  item_frequency: Record<string, number>;
  total_transactions: number;
}

interface AnalysisResultsProps {
  data: AnalysisData;
  onBackToUpload?: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data, onBackToUpload }) => {
  const topRules = data.association_rules
    .sort((a, b) => b.lift - a.lift)
    .slice(0, 10);

  const topItems = Object.entries(data.item_frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const topItemsets = data.frequent_itemsets
    .sort((a, b) => b.support - a.support)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">




        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-slate-800 mb-3">Market Basket Analysis Results</h1>
          <p className="text-lg text-slate-600">Comprehensive insights from your transaction data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-slate-700">Total Transactions</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-[#4169E1]" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-slate-800 mb-1">{data.total_transactions.toLocaleString()}</div>
              <p className="text-sm text-slate-500">Processed transactions</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-slate-700">Frequent Itemsets</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-[#4169E1]" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-slate-800 mb-1">{data.frequent_itemsets.length}</div>
              <p className="text-sm text-slate-500">Item combinations found</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-semibold text-slate-700">Association Rules</CardTitle>
              <div className="w-10 h-10 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                <Target className="h-5 w-5 text-[#4169E1]" />
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-slate-800 mb-1">{data.association_rules.length}</div>
              <p className="text-sm text-slate-500">Rules discovered</p>
            </CardContent>
          </Card>
        </div>


        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                <Target className="h-4 w-4 text-[#4169E1]" />
              </div>
              <CardTitle className="text-2xl font-semibold text-slate-800">Top Association Rules</CardTitle>
            </div>
            <CardDescription className="text-base text-slate-600 ml-11">
              Rules with highest lift values indicating strongest associations between items
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {topRules.map((rule, index) => (
                <div key={index} className="p-6 border border-slate-200 rounded-xl bg-gradient-to-r from-slate-50 to-white hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-600">
                        #{index + 1}
                      </span>
                      <div className="flex items-center space-x-2 text-base font-semibold text-slate-800">
                        <span className="px-3 py-1 bg-[#4169E1] bg-opacity-10 text-[#4169E1] rounded-lg">
                          {rule.antecedents.join(', ')}
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg">
                          {rule.consequents.join(', ')}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-[#4169E1] bg-opacity-10 text-[#4169E1] border-[#4169E1] border-opacity-20 hover:bg-[#4169E1] hover:text-white transition-colors">
                      Lift: {rule.lift.toFixed(2)}
                    </Badge>
                  </div>
                  <div className="flex space-x-6 text-sm text-slate-600 ml-20">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">Support:</span>
                      <span>{(rule.support * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">Confidence:</span>
                      <span>{(rule.confidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">


          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Most Popular Items</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Items with highest frequency across all transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-5">
                {topItems.map(([item, frequency], index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-[#4169E1] bg-opacity-10 text-[#4169E1] rounded-lg flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-800">{item}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-[#4169E1] h-2.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${(frequency / Math.max(...Object.values(data.item_frequency))) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-600 w-12 text-right">
                        {frequency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#4169E1] bg-opacity-10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-[#4169E1]" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800">Frequent Itemsets</CardTitle>
              </div>
              <CardDescription className="text-base text-slate-600 ml-11">
                Most common item combinations with support percentages
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-5">
                {topItemsets.map((itemset, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="w-8 h-8 bg-[#4169E1] bg-opacity-10 text-[#4169E1] rounded-lg flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-semibold text-[#4169E1] bg-[#4169E1] bg-opacity-10 px-3 py-1 rounded-lg">
                        {(itemset.support * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-11">
                      {itemset.itemset.map((item, itemIndex) => (
                        <Badge
                          key={itemIndex}
                          variant="outline"
                          className="text-xs border-slate-300 text-slate-700 hover:border-[#4169E1] hover:text-[#4169E1] transition-colors"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;