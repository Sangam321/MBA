import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import fpgrowth, association_rules
import plotly.express as px
from io import StringIO

st.set_page_config(page_title="Market Basket Analysis - FP-Growth", layout="wide")
st.title("Market Basket Analysis using FP-Growth")
st.markdown("Upload a transaction dataset (CSV format) where each row contains a list of items separated by commas.")

uploaded_file = st.file_uploader("Upload your groceries.csv file", type=["csv"])

if uploaded_file is not None:
    stringio = StringIO(uploaded_file.getvalue().decode("utf-8"))
    transactions = [line.strip().split(',') for line in stringio.readlines()]

    te = TransactionEncoder()
    te_array = te.fit(transactions).transform(transactions)
    df = pd.DataFrame(te_array, columns=te.columns_)

    min_support = 0.05
    frequent_itemsets = fpgrowth(df, min_support=min_support, use_colnames=True)
    rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)

    top_item = frequent_itemsets.sort_values("support", ascending=False).iloc[0]["itemsets"]
    top_combo = rules.sort_values("lift", ascending=False).iloc[0]

    st.subheader("Recommendation")
    st.markdown(f"""
    - Most selling item: **{', '.join(top_item)}**
    - Most popular product combination: **{', '.join(list(top_combo['antecedents']))} and {', '.join(list(top_combo['consequents']))}**

    **Insights & Suggestions:**
    - These two items are frequently bought together by many customers.
    - Try placing them close to each other on shelves to make it easier for customers to find and grab both.
    - Consider offering a combo pack or bundle discount to encourage customers to buy them together.
    - Promote these items together in flyers, online ads, or store signage for better visibility.
    - This strategy can help increase total basket value and customer satisfaction.
    """)

    st.subheader("Visualizations")

    st.markdown("### 1. Item Frequency Histogram")
    item_counts = df.sum().sort_values(ascending=False).head(20)
    fig1, ax1 = plt.subplots(figsize=(12, 6))
    sns.barplot(x=item_counts.values, y=item_counts.index, ax=ax1, palette="viridis")
    ax1.set_xlabel("Frequency")
    ax1.set_ylabel("Items")
    ax1.set_title("Top 20 Most Frequent Items")
    st.pyplot(fig1)

    st.markdown("### 2. Affinity Matrix (Item Co-occurrence Heatmap)")
    co_matrix = df.T.dot(df)
    mask = np.triu(np.ones_like(co_matrix, dtype=bool))
    fig2, ax2 = plt.subplots(figsize=(14, 10))
    sns.heatmap(co_matrix, cmap="YlGnBu", mask=mask, annot=False)
    ax2.set_title("Affinity Matrix of Items")
    st.pyplot(fig2)

    st.markdown("### 3. Packed Bubble Chart of Top Items")
    top_items = frequent_itemsets.explode("itemsets")
    bubble_df = top_items.groupby("itemsets")["support"].sum().reset_index()
    bubble_df.columns = ["item", "support"]
    fig3 = px.scatter(
        bubble_df, x="support", y="item", size="support", color="item",
        hover_name="item", size_max=60, title="Item Popularity (Bubble Size by Support)"
    )
    st.plotly_chart(fig3, use_container_width=True)

    st.markdown("### 4. Bar Chart of Top Frequent Itemsets")
    top_n = 10
    top_itemsets = frequent_itemsets.nlargest(top_n, 'support')
    top_itemsets["itemsets"] = top_itemsets["itemsets"].apply(lambda x: ', '.join(x))
    fig4 = px.bar(
        top_itemsets, x="itemsets", y="support", color="support", title="Top Frequent Itemsets"
    )
    st.plotly_chart(fig4, use_container_width=True)

    st.markdown("### 5. Most Common Item Combinations")
    top_rules = rules.sort_values(by='lift', ascending=False).head(10)
    fig5 = px.bar(
        top_rules,
        x=top_rules['lift'],
        y=top_rules.apply(lambda r: f"{', '.join(r['antecedents'])} → {', '.join(r['consequents'])}", axis=1),
        orientation='h',
        color='lift',
        title="Top Item Combinations Often Bought Together"
    )
    st.plotly_chart(fig5, use_container_width=True)

else:
    st.info("Please upload a groceries CSV file to begin analysis.")
