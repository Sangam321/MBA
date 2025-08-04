import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Target, TrendingUp } from 'lucide-react';
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
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data }) => {
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
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_transactions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequent Itemsets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.frequent_itemsets.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Association Rules</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.association_rules.length}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top Association Rules</CardTitle>
          <CardDescription>
            Rules with highest lift values indicating strongest associations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topRules.map((rule, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {rule.antecedents.join(', ')} → {rule.consequents.join(', ')}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    Lift: {rule.lift.toFixed(2)}
                  </Badge>
                </div>
                <div className="flex space-x-4 text-sm text-muted-foreground">
                  <span>Support: {(rule.support * 100).toFixed(1)}%</span>
                  <span>Confidence: {(rule.confidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Most Popular Items</CardTitle>
            <CardDescription>Items with highest frequency across transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topItems.map(([item, frequency], index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${(frequency / Math.max(...Object.values(data.item_frequency))) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">
                      {frequency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frequent Itemsets</CardTitle>
            <CardDescription>Most common item combinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topItemsets.map((itemset, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {itemset.itemset.map((item, itemIndex) => (
                      <Badge key={itemIndex} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {(itemset.support * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisResults;