import { useEffect, useMemo, useState } from "react"
import {
  Area,
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"

// Embedded Data
const RAW_SALES = [{"date":"31/07/2023","New Web Customers":11,"New customer revenue":329.6,"nAOV":29.96,"Website":1004.8,"Amazon sales":1792,"FB Ad Spend":183.43,"Amazon ad spend":497.37,"Total ad spend":680.8,"Total":2796.8,"New Customer Aq Cost":16.68,"nROAS":1.8,"AMAZON MER":27.76,"WEB MER":18.26,"TOTAL MER":24.34},{"date":"07/08/2023","New Web Customers":11,"New customer revenue":288,"nAOV":26.18,"Website":1094,"Amazon sales":2048,"FB Ad Spend":0,"Amazon ad spend":445.65,"Total ad spend":445.65,"Total":3142,"New Customer Aq Cost":0,"nROAS":null,"AMAZON MER":21.76,"WEB MER":0,"TOTAL MER":14.18},{"date":"14/08/2023","New Web Customers":18,"New customer revenue":434.8,"nAOV":24.16,"Website":1129.2,"Amazon sales":1312,"FB Ad Spend":0,"Amazon ad spend":373.95,"Total ad spend":373.95,"Total":2441.2,"New Customer Aq Cost":0,"nROAS":null,"AMAZON MER":28.5,"WEB MER":0,"TOTAL MER":15.32},{"date":"21/08/2023","New Web Customers":8,"New customer revenue":188,"nAOV":23.5,"Website":817.2,"Amazon sales":1952,"FB Ad Spend":0,"Amazon ad spend":408.75,"Total ad spend":408.75,"Total":2769.2,"New Customer Aq Cost":0,"nROAS":null,"AMAZON MER":20.94,"WEB MER":0,"TOTAL MER":14.76},{"date":"28/08/2023","New Web Customers":11,"New customer revenue":242,"nAOV":22,"Website":1104.16,"Amazon sales":1440,"FB Ad Spend":83.62,"Amazon ad spend":442.57,"Total ad spend":526.19,"Total":2544.16,"New Customer Aq Cost":7.6,"nROAS":2.89,"AMAZON MER":30.73,"WEB MER":7.57,"TOTAL MER":20.68},{"date":"04/09/2023","New Web Customers":29,"New customer revenue":837.92,"nAOV":28.89,"Website":1231.12,"Amazon sales":1665.6,"FB Ad Spend":360,"Amazon ad spend":390.16,"Total ad spend":750.16,"Total":2896.72,"New Customer Aq Cost":12.41,"nROAS":2.33,"AMAZON MER":23.42,"WEB MER":29.24,"TOTAL MER":25.9},{"date":"11/09/2023","New Web Customers":24,"New customer revenue":739.12,"nAOV":30.8,"Website":1482.72,"Amazon sales":2058.56,"Google Ad Spend":89.1,"FB Ad Spend":217.37,"Amazon ad spend":453.1,"Total ad spend":759.57,"Total":3541.28,"New Customer Aq Cost":12.77,"nROAS":2.41,"AMAZON MER":22.01,"WEB MER":20.67,"TOTAL MER":21.45},{"date":"18/09/2023","New Web Customers":25,"New customer revenue":791.04,"nAOV":31.64,"Website":1570.64,"Amazon sales":1504,"Google Ad Spend":110,"FB Ad Spend":245.96,"Amazon ad spend":361.32,"Total ad spend":717.28,"Total":3074.64,"New Customer Aq Cost":14.24,"nROAS":2.22,"AMAZON MER":24.02,"WEB MER":15.66,"TOTAL MER":19.75},{"date":"25/09/2023","New Web Customers":27,"New customer revenue":994.32,"nAOV":36.83,"Website":1777.76,"Amazon sales":1600,"Google Ad Spend":77.84,"FB Ad Spend":515.38,"Amazon ad spend":361.32,"Total ad spend":954.54,"Total":3377.76,"New Customer Aq Cost":21.97,"nROAS":1.68,"AMAZON MER":22.58,"WEB MER":28.99,"TOTAL MER":25.96},{"date":"02/10/2023","New Web Customers":18,"New customer revenue":548.8,"nAOV":30.49,"Website":1409.6,"Amazon sales":1600,"Google Ad Spend":55.1,"FB Ad Spend":30,"Amazon ad spend":394.05,"Total ad spend":479.15,"Total":3009.6,"New Customer Aq Cost":4.73,"nROAS":6.45,"AMAZON MER":24.63,"WEB MER":2.13,"TOTAL MER":14.09},{"date":"09/10/2023","New Web Customers":8,"New customer revenue":266.82,"nAOV":33.35,"Website":956.02,"Amazon sales":1268,"Google Ad Spend":56.01,"FB Ad Spend":0,"Amazon ad spend":333.64,"Total ad spend":389.65,"Total":2224.02,"New Customer Aq Cost":7,"nROAS":4.76,"AMAZON MER":26.31,"WEB MER":0,"TOTAL MER":15},{"date":"16/10/2023","New Web Customers":5,"New customer revenue":115.2,"nAOV":23.04,"Website":727.2,"Amazon sales":836,"Google Ad Spend":50.28,"FB Ad Spend":0,"Amazon ad spend":352.49,"Total ad spend":402.77,"Total":1563.2,"New Customer Aq Cost":10.06,"nROAS":2.29,"AMAZON MER":42.16,"WEB MER":0,"TOTAL MER":22.55},{"date":"23/10/2023","New Web Customers":21,"New customer revenue":611.52,"nAOV":29.12,"Website":1336.32,"Amazon sales":826,"Google Ad Spend":37.15,"FB Ad Spend":428.87,"Amazon ad spend":283.28,"Total ad spend":749.3,"Total":2162.32,"New Customer Aq Cost":22.19,"nROAS":1.31,"AMAZON MER":34.3,"WEB MER":32.09,"TOTAL MER":32.93},{"date":"30/10/2023","New Web Customers":39,"New customer revenue":1146.24,"nAOV":29.39,"Website":2152.88,"Amazon sales":1001.6,"Google Ad Spend":46.63,"FB Ad Spend":511.75,"Amazon ad spend":350.82,"Total ad spend":909.2,"Total":3154.48,"New Customer Aq Cost":14.32,"nROAS":2.05,"AMAZON MER":35.03,"WEB MER":23.77,"TOTAL MER":27.34},{"date":"06/11/2023","New Web Customers":32,"New customer revenue":693.24,"nAOV":21.66,"Website":1648.84,"Amazon sales":1038,"Google Ad Spend":75.76,"FB Ad Spend":488,"Amazon ad spend":340.16,"Total ad spend":903.92,"Total":2686.84,"New Customer Aq Cost":17.62,"nROAS":1.23,"AMAZON MER":32.77,"WEB MER":29.6,"TOTAL MER":30.82},{"date":"13/11/2023","New Web Customers":35,"New customer revenue":1228.88,"nAOV":35.11,"Website":1994.28,"Amazon sales":1224,"Google Ad Spend":76.37,"FB Ad Spend":526.89,"Amazon ad spend":403.37,"Total ad spend":1006.63,"Total":3218.28,"New Customer Aq Cost":17.24,"nROAS":2.04,"AMAZON MER":32.96,"WEB MER":26.42,"TOTAL MER":28.91},{"date":"20/11/2023","New Web Customers":22,"New customer revenue":735.66,"nAOV":33.44,"Website":2060.66,"Amazon sales":1047.91,"Google Ad Spend":70,"FB Ad Spend":450,"Amazon ad spend":403.37,"Total ad spend":923.37,"Total":3108.57,"New Customer Aq Cost":23.64,"nROAS":1.41,"AMAZON MER":38.49,"WEB MER":21.84,"TOTAL MER":27.45},{"date":"27/11/2023","New Web Customers":22,"New customer revenue":964.18,"nAOV":43.83,"Website":2088.66,"Amazon sales":1113.92,"Google Ad Spend":57.66,"FB Ad Spend":359.78,"Amazon ad spend":451.17,"Total ad spend":868.61,"Total":3202.58,"New Customer Aq Cost":18.97,"nROAS":2.31,"AMAZON MER":40.5,"WEB MER":17.23,"TOTAL MER":25.32},{"date":"04/12/2023","New Web Customers":24,"New customer revenue":1093.64,"nAOV":45.57,"Website":2092.98,"Amazon sales":1341.8,"Google Ad Spend":77.23,"FB Ad Spend":672.5,"Amazon ad spend":359.61,"Total ad spend":1109.34,"Total":3434.78,"New Customer Aq Cost":31.24,"nROAS":1.46,"AMAZON MER":26.8,"WEB MER":32.13,"TOTAL MER":30.05},{"date":"11/12/2023","New Web Customers":35,"New customer revenue":464,"nAOV":13.26,"Website":2052,"Amazon sales":1830,"Google Ad Spend":69,"FB Ad Spend":678,"Amazon ad spend":437.07,"Total ad spend":1184.07,"Total":3882,"New Customer Aq Cost":21.34,"nROAS":0.62,"AMAZON MER":23.88,"WEB MER":33.04,"TOTAL MER":28.72},{"date":"18/12/2023","New Web Customers":7,"New customer revenue":378.72,"nAOV":54.1,"Website":1140.52,"Amazon sales":1510,"Google Ad Spend":38,"FB Ad Spend":0,"Amazon ad spend":663.44,"Total ad spend":701.44,"Total":2650.52,"New Customer Aq Cost":5.43,"nROAS":9.97,"AMAZON MER":43.94,"WEB MER":0,"TOTAL MER":25.03},{"date":"25/12/2023","New Web Customers":6,"New customer revenue":156.4,"nAOV":26.07,"Website":1119.36,"Amazon sales":1708,"Google Ad Spend":44,"FB Ad Spend":0,"Amazon ad spend":625.88,"Total ad spend":669.88,"Total":2827.36,"New Customer Aq Cost":7.33,"nROAS":3.55,"AMAZON MER":36.64,"WEB MER":0,"TOTAL MER":22.14},{"date":"01/01/2024","New Web Customers":10,"New customer revenue":290.4,"nAOV":29.04,"Website":1084.96,"Amazon sales":1712,"Google Ad Spend":79.71,"FB Ad Spend":0,"Amazon ad spend":754.34,"Total ad spend":834.05,"Total":2796.96,"New Customer Aq Cost":7.97,"nROAS":3.64,"AMAZON MER":44.06,"WEB MER":0,"TOTAL MER":26.97},{"date":"08/01/2024","New Web Customers":10,"New customer revenue":374,"nAOV":37.4,"Website":1611.6,"Amazon sales":2570,"Google Ad Spend":63.35,"FB Ad Spend":0,"Amazon ad spend":837.49,"Total ad spend":900.84,"Total":4181.6,"New Customer Aq Cost":6.34,"nROAS":5.9,"AMAZON MER":32.59,"WEB MER":0,"TOTAL MER":20.03},{"date":"15/01/2024","New Web Customers":12,"New customer revenue":533.6,"nAOV":44.47,"Website":1358.6,"Amazon sales":2264,"Google Ad Spend":59.94,"FB Ad Spend":0,"Amazon ad spend":887.46,"Total ad spend":947.4,"Total":3622.6,"New Customer Aq Cost":5,"nROAS":8.9,"AMAZON MER":39.2,"WEB MER":0,"TOTAL MER":24.5},{"date":"22/01/2024","New Web Customers":17,"New customer revenue":665.6,"nAOV":39.15,"Website":1850.98,"Amazon sales":3040,"Google Ad Spend":73.99,"FB Ad Spend":225.74,"Amazon ad spend":1062.63,"Total ad spend":1362.36,"Total":4890.98,"New Customer Aq Cost":17.63,"nROAS":2.22,"AMAZON MER":34.95,"WEB MER":12.2,"TOTAL MER":26.34},{"date":"29/01/2024","New Web Customers":25,"New customer revenue":1316,"nAOV":52.64,"Website":2518.84,"Amazon sales":3710,"Google Ad Spend":55.31,"FB Ad Spend":676,"Amazon ad spend":1092.39,"Total ad spend":1823.7,"Total":6228.84,"New Customer Aq Cost":29.25,"nROAS":1.8,"AMAZON MER":29.44,"WEB MER":26.84,"TOTAL MER":28.39},{"date":"05/02/2024","New Web Customers":27,"New customer revenue":1235.2,"nAOV":45.75,"Website":2229.4,"Amazon sales":2378,"Google Ad Spend":74.23,"FB Ad Spend":574.8,"Amazon ad spend":1000.5,"Total ad spend":1649.53,"Total":4607.4,"New Customer Aq Cost":24.04,"nROAS":1.9,"AMAZON MER":42.07,"WEB MER":25.78,"TOTAL MER":34.19},{"date":"12/02/2024","New Web Customers":18,"New customer revenue":757.6,"nAOV":42.09,"Website":1674.7,"Amazon sales":2442,"Google Ad Spend":46.97,"FB Ad Spend":470.29,"Amazon ad spend":1128,"Total ad spend":1645.26,"Total":4116.7,"New Customer Aq Cost":28.74,"nROAS":1.46,"Net Profit (TW)":257,"AMAZON MER":46.19,"WEB MER":28.08,"TOTAL MER":38.82},{"date":"19/02/2024","New Web Customers":39,"New customer revenue":1204.4,"nAOV":30.88,"Website":2265.92,"Amazon sales":2604,"Google Ad Spend":50.71,"FB Ad Spend":974.74,"Amazon ad spend":986.7,"Total ad spend":2012.15,"Total":4869.92,"New Customer Aq Cost":26.29,"nROAS":1.17,"Net Profit (TW)":359,"AMAZON MER":37.89,"WEB MER":43.02,"TOTAL MER":40.28},{"date":"26/02/2024","New Web Customers":37,"New customer revenue":1308.29,"nAOV":35.36,"Website":2646.13,"Amazon sales":3494,"Google Ad Spend":49.8,"FB Ad Spend":1077.97,"Amazon ad spend":1060.5,"Total ad spend":2188.27,"Total":6140.13,"New Customer Aq Cost":30.48,"nROAS":1.16,"Net Profit (TW)":591,"AMAZON MER":30.35,"WEB MER":40.74,"TOTAL MER":34.83},{"date":"04/03/2024","New Web Customers":34,"New customer revenue":1541.2,"nAOV":45.33,"Website":2791.1,"Amazon sales":2516,"Google Ad Spend":50.04,"FB Ad Spend":746.72,"Amazon ad spend":924.52,"Total ad spend":1721.28,"Total":5307.1,"New Customer Aq Cost":23.43,"nROAS":1.93,"Net Profit (TW)":1096,"AMAZON MER":36.75,"WEB MER":26.75,"TOTAL MER":31.49},{"date":"11/03/2024","New Web Customers":27,"New customer revenue":944.4,"nAOV":34.98,"Website":2025.2,"Amazon sales":2824,"Google Ad Spend":48.71,"FB Ad Spend":882.23,"Amazon ad spend":1087.09,"Total ad spend":2018.03,"Total":4849.2,"New Customer Aq Cost":34.48,"nROAS":1.01,"Net Profit (TW)":324,"AMAZON MER":38.49,"WEB MER":43.56,"TOTAL MER":40.61},{"date":"18/03/2024","New Web Customers":34,"New customer revenue":1472.7,"nAOV":43.31,"Website":2727.2,"Amazon sales":2986,"Google Ad Spend":123,"FB Ad Spend":737.24,"Amazon ad spend":1019.08,"Total ad spend":1879.32,"Total":5713.2,"New Customer Aq Cost":25.3,"nROAS":1.71,"Net Profit (TW)":892,"AMAZON MER":34.13,"WEB MER":27.03,"TOTAL MER":30.74},{"date":"25/03/2024","New Web Customers":34,"New customer revenue":1213.3,"nAOV":35.69,"Website":2822.68,"Amazon sales":2744,"Google Ad Spend":124.03,"FB Ad Spend":908.61,"Amazon ad spend":949.74,"Total ad spend":1982.38,"Total":5566.68,"New Customer Aq Cost":30.37,"nROAS":1.17,"Net Profit (TW)":764,"AMAZON MER":34.61,"WEB MER":32.19,"TOTAL MER":33.38},{"date":"01/04/2024","New Web Customers":66,"New customer revenue":2290.2,"nAOV":34.7,"Website":4357.3,"Amazon sales":1872,"Google Ad Spend":112.95,"FB Ad Spend":1399.15,"Amazon ad spend":982,"Total ad spend":2494.1,"Total":6229.3,"New Customer Aq Cost":22.91,"nROAS":1.51,"Net Profit (TW)":1261,"AMAZON MER":52.46,"WEB MER":32.11,"TOTAL MER":38.23},{"date":"08/04/2024","New Web Customers":51,"New customer revenue":1801.3,"nAOV":35.32,"Website":3400.15,"Amazon sales":3041.44,"Google Ad Spend":119.2,"FB Ad Spend":1257.56,"Amazon ad spend":980.85,"Total ad spend":2357.61,"Total":6441.59,"New Customer Aq Cost":27,"nROAS":1.31,"Net Profit (TW)":863,"AMAZON MER":32.25,"WEB MER":36.99,"TOTAL MER":34.75},{"date":"15/04/2024","New Web Customers":50,"New customer revenue":1686.57,"nAOV":33.73,"Website":2752.54,"Amazon sales":2284,"Google Ad Spend":149.13,"FB Ad Spend":1060.85,"Amazon ad spend":717.4,"Total ad spend":1927.38,"Total":5036.54,"New Customer Aq Cost":24.2,"nROAS":1.39,"Net Profit (TW)":492,"AMAZON MER":31.41,"WEB MER":38.54,"TOTAL MER":35.31},{"date":"22/04/2024","New Web Customers":65,"New customer revenue":2051.2,"nAOV":31.56,"Website":3565.05,"Amazon sales":1790,"Google Ad Spend":165.14,"FB Ad Spend":1290.85,"Amazon ad spend":610.41,"Total ad spend":2066.4,"Total":5355.05,"New Customer Aq Cost":22.4,"nROAS":1.41,"Net Profit (TW)":867,"AMAZON MER":34.1,"WEB MER":36.21,"TOTAL MER":35.5},{"date":"29/04/2024","New Web Customers":87,"New customer revenue":2595.6,"nAOV":29.83,"Website":4771.6,"Amazon sales":2147.44,"Google Ad Spend":107.4,"FB Ad Spend":1331.9,"Amazon ad spend":487.11,"Total ad spend":1926.41,"Total":6919.04,"New Customer Aq Cost":16.54,"nROAS":1.8,"Net Profit (TW)":1539,"AMAZON MER":22.68,"WEB MER":27.91,"TOTAL MER":26.29},{"date":"06/05/2024","New Web Customers":66,"New customer revenue":2119.2,"nAOV":32.11,"Website":3340.7,"Amazon sales":1285.72,"Google Ad Spend":147.64,"FB Ad Spend":1330.57,"Amazon ad spend":574,"Total ad spend":2052.21,"Total":4626.42,"New Customer Aq Cost":22.4,"nROAS":1.43,"Net Profit (TW)":670,"AMAZON MER":44.64,"WEB MER":39.83,"TOTAL MER":41.17},{"date":"13/05/2024","New Web Customers":94,"New customer revenue":2976.8,"nAOV":31.67,"Website":5455.75,"Amazon sales":2356,"Google Ad Spend":146.98,"FB Ad Spend":1504.12,"Amazon ad spend":827,"Total ad spend":2478.1,"Total":7811.75,"New Customer Aq Cost":17.56,"nROAS":1.8,"Net Profit (TW)":2198,"AMAZON MER":35.1,"WEB MER":27.57,"TOTAL MER":29.84},{"date":"20/05/2024","New Web Customers":90,"New customer revenue":2984.8,"nAOV":33.16,"Website":5363.19,"Amazon sales":2668.86,"Google Ad Spend":135.37,"FB Ad Spend":1982.77,"Amazon ad spend":706.16,"Total ad spend":2824.3,"Total":8032.05,"New Customer Aq Cost":23.53,"nROAS":1.41,"Net Profit (TW)":1379,"AMAZON MER":26.46,"WEB MER":36.97,"TOTAL MER":33.48},{"date":"27/05/2024","New Web Customers":96,"New customer revenue":3660.44,"nAOV":38.13,"Website":5770.96,"Amazon sales":2351.72,"Google Ad Spend":142.45,"FB Ad Spend":2657.11,"Amazon ad spend":535.31,"Total ad spend":3334.87,"Total":8122.68,"New Customer Aq Cost":29.16,"nROAS":1.31,"Net Profit (TW)":1068,"AMAZON MER":22.76,"WEB MER":46.04,"TOTAL MER":39.3},{"date":"03/06/2024","New Web Customers":148,"New customer revenue":5072.4,"nAOV":34.27,"Website":7676.5,"Amazon sales":1964,"Google Ad Spend":208.99,"FB Ad Spend":3186.34,"Amazon ad spend":500.05,"Total ad spend":3895.38,"Total":9640.5,"New Customer Aq Cost":22.94,"nROAS":1.49,"Net Profit (TW)":1703,"AMAZON MER":25.46,"WEB MER":41.51,"TOTAL MER":38.24},{"date":"10/06/2024","New Web Customers":139,"New customer revenue":4871.8,"nAOV":35.05,"Website":7722.9,"Amazon sales":2209.44,"Google Ad Spend":199.66,"FB Ad Spend":3401.66,"Amazon ad spend":829,"Total ad spend":4430.32,"Total":9932.34,"New Customer Aq Cost":25.91,"nROAS":1.35,"Net Profit (TW)":1560,"AMAZON MER":37.52,"WEB MER":44.05,"TOTAL MER":42.59},{"date":"17/06/2024","New Web Customers":141,"New customer revenue":4546.4,"nAOV":32.24,"Website":6582.45,"Amazon sales":2512,"Google Ad Spend":199.78,"FB Ad Spend":3625.13,"Amazon ad spend":1225.19,"Total ad spend":5050.1,"Total":9094.45,"New Customer Aq Cost":27.13,"nROAS":1.19,"Net Profit (TW)":393,"AMAZON MER":48.77,"WEB MER":55.07,"TOTAL MER":53.33},{"date":"24/06/2024","New Web Customers":125,"New customer revenue":4656,"nAOV":37.25,"Website":7593.36,"Amazon sales":2168,"Google Ad Spend":229.3,"FB Ad Spend":3570.09,"Amazon ad spend":946,"Total ad spend":4745.39,"Total":9761.36,"New Customer Aq Cost":30.4,"nROAS":1.23,"Net Profit (TW)":1102,"AMAZON MER":43.63,"WEB MER":47.02,"TOTAL MER":46.26},{"date":"01/07/2024","New Web Customers":133,"New customer revenue":4582.24,"nAOV":34.45,"Website":8298.08,"Amazon sales":1464,"Google Ad Spend":256.48,"FB Ad Spend":3596.57,"Amazon ad spend":681,"Total ad spend":4534.05,"Total":9762.08,"New Customer Aq Cost":28.97,"nROAS":1.19,"Net Profit (TW)":1474,"AMAZON MER":46.52,"WEB MER":43.34,"TOTAL MER":43.82},{"date":"08/07/2024","New Web Customers":87,"New customer revenue":3238.07,"nAOV":37.22,"Website":6065.15,"Amazon sales":1674,"Google Ad Spend":238.6,"FB Ad Spend":1749.2,"Amazon ad spend":655.42,"Total ad spend":2643.22,"Total":7739.15,"New Customer Aq Cost":22.85,"nROAS":1.63,"Net Profit (TW)":1908,"AMAZON MER":39.15,"WEB MER":28.84,"TOTAL MER":31.07},{"date":"15/07/2024","New Web Customers":37,"New customer revenue":1251.7,"nAOV":33.83,"Website":4114.8,"Amazon sales":2699.8,"Google Ad Spend":245.66,"FB Ad Spend":1050.57,"Amazon ad spend":817,"Total ad spend":2113.23,"Total":6814.6,"New Customer Aq Cost":35.03,"nROAS":0.97,"Net Profit (TW)":1198,"AMAZON MER":30.26,"WEB MER":25.53,"TOTAL MER":27.41},{"date":"22/07/2024","New Web Customers":36,"New customer revenue":1486.78,"nAOV":41.3,"Website":3137.62,"Amazon sales":1574,"Google Ad Spend":225.1,"FB Ad Spend":806.24,"Amazon ad spend":782,"Total ad spend":1813.34,"Total":4711.62,"New Customer Aq Cost":28.65,"nROAS":1.44,"Net Profit (TW)":741,"AMAZON MER":49.68,"WEB MER":25.7,"TOTAL MER":33.71},{"date":"29/07/2024","New Web Customers":22,"New customer revenue":451.52,"nAOV":20.52,"Website":3790.08,"Amazon sales":1836,"Google Ad Spend":272.64,"FB Ad Spend":733.12,"Amazon ad spend":825.19,"Total ad spend":1830.95,"Total":5626.08,"New Customer Aq Cost":45.72,"nROAS":0.45,"Net Profit (TW)":1436,"AMAZON MER":44.94,"WEB MER":19.34,"TOTAL MER":27.7},{"date":"05/08/2024","New Web Customers":55,"New customer revenue":1969.8,"nAOV":35.81,"Website":4329.2,"Amazon sales":2146,"Google Ad Spend":243.17,"FB Ad Spend":1161.05,"Amazon ad spend":974,"Total ad spend":2378.22,"Total":6475.2,"New Customer Aq Cost":25.53,"nROAS":1.4,"Net Profit (TW)":1302,"AMAZON MER":45.39,"WEB MER":26.82,"TOTAL MER":32.97},{"date":"12/08/2024","New Web Customers":96,"New customer revenue":3816.54,"nAOV":39.76,"Website":9555.54,"Amazon sales":2370,"Google Ad Spend":297.35,"FB Ad Spend":2970.68,"Amazon ad spend":1113,"Total ad spend":4381.03,"Total":11925.54,"New Customer Aq Cost":34.04,"nROAS":1.17,"Net Profit (TW)":2799,"AMAZON MER":46.96,"WEB MER":31.09,"TOTAL MER":34.24},{"date":"19/08/2024","New Web Customers":114,"New customer revenue":4369.2,"nAOV":38.33,"Website":7367.22,"Amazon sales":1912,"Google Ad Spend":312.75,"FB Ad Spend":3153.99,"Amazon ad spend":1313.12,"Total ad spend":4779.86,"Total":9279.22,"New Customer Aq Cost":30.41,"nROAS":1.26,"Net Profit (TW)":1278,"AMAZON MER":68.68,"WEB MER":42.81,"TOTAL MER":48.14},{"date":"26/08/2024","New Web Customers":102,"New customer revenue":3970.34,"nAOV":38.92,"Website":6270.7,"Amazon sales":2356,"Google Ad Spend":169.7,"FB Ad Spend":3171.01,"Amazon ad spend":1067,"Total ad spend":4407.71,"Total":8626.7,"New Customer Aq Cost":32.75,"nROAS":1.19,"Net Profit (TW)":668,"AMAZON MER":45.29,"WEB MER":50.57,"TOTAL MER":49.13},{"date":"02/09/2024","New Web Customers":137,"New customer revenue":4740.66,"nAOV":34.6,"Website":7229.34,"Amazon sales":2450,"Google Ad Spend":201.59,"FB Ad Spend":3966.94,"Amazon ad spend":1215,"Total ad spend":5383.53,"Total":9679.34,"New Customer Aq Cost":30.43,"nROAS":1.14,"Net Profit (TW)":481,"AMAZON MER":49.59,"WEB MER":54.87,"TOTAL MER":53.54},{"date":"09/09/2024","New Web Customers":105,"New customer revenue":4512.9,"nAOV":42.98,"Website":9243.9,"Amazon sales":2424,"Google Ad Spend":310.75,"FB Ad Spend":2803.01,"Amazon ad spend":1816,"Total ad spend":4929.76,"Total":11667.9,"New Customer Aq Cost":29.65,"nROAS":1.45,"Net Profit (TW)":2666,"AMAZON MER":74.92,"WEB MER":30.32,"TOTAL MER":39.59},{"date":"16/09/2024","New Web Customers":96,"New customer revenue":3705.6,"nAOV":38.35,"Website":7281.3,"Amazon sales":2734,"Google Ad Spend":231.53,"FB Ad Spend":3195.77,"Amazon ad spend":1489,"Total ad spend":4916.3,"Total":10015.3,"New Customer Aq Cost":35.7,"nROAS":1.08,"Net Profit (TW)":1328,"AMAZON MER":54.46,"WEB MER":43.89,"TOTAL MER":46.78},{"date":"23/09/2024","New Web Customers":156,"New customer revenue":5554,"nAOV":35.45,"Website":8774.34,"Amazon sales":2796,"Google Ad Spend":261.67,"FB Ad Spend":4440.33,"Amazon ad spend":1489,"Total ad spend":6191,"Total":11570.34,"New Customer Aq Cost":30.14,"nROAS":1.18,"Net Profit (TW)":998,"AMAZON MER":53.25,"WEB MER":50.61,"TOTAL MER":51.25},{"date":"30/09/2024","New Web Customers":157,"New customer revenue":5126.6,"nAOV":32.5,"Website":8536.7,"Amazon sales":2844,"Google Ad Spend":298.21,"FB Ad Spend":4743.14,"Amazon ad spend":1275.98,"Total ad spend":6317.33,"Total":11380.7,"New Customer Aq Cost":32.11,"nROAS":1.02,"Net Profit (TW)":554,"AMAZON MER":44.87,"WEB MER":55.56,"TOTAL MER":52.89},{"date":"07/10/2024","New Web Customers":165,"New customer revenue":5692.8,"nAOV":34.5,"Website":10135.82,"Amazon sales":3020,"Google Ad Spend":263.73,"FB Ad Spend":4709.53,"Amazon ad spend":1416.16,"Total ad spend":6389.42,"Total":13155.82,"New Customer Aq Cost":30.14,"nROAS":1.14,"Net Profit (TW)":1575,"AMAZON MER":46.89,"WEB MER":46.46,"TOTAL MER":46.56},{"date":"14/10/2024","New Web Customers":185,"New customer revenue":6557.8,"nAOV":35.45,"Website":11310.18,"Amazon sales":2942.6,"Google Ad Spend":311.23,"FB Ad Spend":4720.89,"Amazon ad spend":1134.67,"Total ad spend":6166.79,"Total":14252.78,"New Customer Aq Cost":27.2,"nROAS":1.3,"Net Profit (TW)":2180,"AMAZON MER":38.56,"WEB MER":41.74,"TOTAL MER":41.08},{"date":"21/10/2024","New Web Customers":130,"New customer revenue":4559.6,"nAOV":35.07,"Website":8489.5,"Amazon sales":2418,"Google Ad Spend":261.93,"FB Ad Spend":2414.95,"Amazon ad spend":967.91,"Total ad spend":3644.79,"Total":10907.5,"New Customer Aq Cost":20.59,"nROAS":1.7,"Net Profit (TW)":2681,"AMAZON MER":40.03,"WEB MER":28.45,"TOTAL MER":31.01},{"date":"28/10/2024","New Web Customers":43,"New customer revenue":1828.97,"nAOV":42.53,"Website":5799.51,"Amazon sales":2342,"Google Ad Spend":297.6,"FB Ad Spend":228.87,"Amazon ad spend":1125.86,"Total ad spend":1652.33,"Total":8141.51,"New Customer Aq Cost":12.24,"nROAS":3.47,"Net Profit (TW)":3164,"AMAZON MER":48.07,"WEB MER":3.95,"TOTAL MER":16.64},{"date":"04/11/2024","New Web Customers":21,"New customer revenue":764.3,"nAOV":36.4,"Website":3862.9,"Amazon sales":2242,"Google Ad Spend":259.93,"FB Ad Spend":0,"Amazon ad spend":1331.73,"Total ad spend":1591.66,"Total":6104.9,"New Customer Aq Cost":12.38,"nROAS":2.94,"Net Profit (TW)":2065,"AMAZON MER":59.4,"WEB MER":0,"TOTAL MER":21.81},{"date":"11/11/2024","New Web Customers":104,"New customer revenue":3424.2,"nAOV":32.93,"Website":7669.96,"Amazon sales":2346,"Google Ad Spend":308,"FB Ad Spend":2961.02,"Amazon ad spend":1090,"Total ad spend":4359.02,"Total":10015.96,"New Customer Aq Cost":31.43,"nROAS":1.05,"Net Profit (TW)":1566,"AMAZON MER":46.46,"WEB MER":38.61,"TOTAL MER":40.45},{"date":"18/11/2024","New Web Customers":50,"New customer revenue":1883.75,"nAOV":37.68,"Website":6223.29,"Amazon sales":2715.2,"Google Ad Spend":211.16,"FB Ad Spend":1567.07,"Amazon ad spend":1318,"Total ad spend":3096.23,"Total":8938.49,"New Customer Aq Cost":35.56,"nROAS":1.06,"Net Profit (TW)":1981,"AMAZON MER":48.54,"WEB MER":25.18,"TOTAL MER":32.28},{"date":"25/11/2024","New Web Customers":14,"New customer revenue":638.4,"nAOV":45.6,"Website":3409.5,"Amazon sales":2202,"Google Ad Spend":194.96,"FB Ad Spend":0,"Amazon ad spend":1121.96,"Total ad spend":1316.92,"Total":5611.5,"New Customer Aq Cost":13.93,"nROAS":3.27,"Net Profit (TW)":1771,"AMAZON MER":50.95,"WEB MER":0,"TOTAL MER":19.99},{"date":"02/12/2024","New Web Customers":19,"New customer revenue":925.4,"nAOV":48.71,"Website":3523.17,"Amazon sales":2220,"Google Ad Spend":190.93,"FB Ad Spend":0,"Amazon ad spend":1015.44,"Total ad spend":1206.37,"Total":5743.17,"New Customer Aq Cost":10.05,"nROAS":4.85,"Net Profit (TW)":1956,"AMAZON MER":45.74,"WEB MER":0,"TOTAL MER":17.68},{"date":"09/12/2024","New Web Customers":22,"New customer revenue":1011.96,"nAOV":46,"Website":8419.72,"Amazon sales":2012,"Google Ad Spend":244.86,"FB Ad Spend":0,"Amazon ad spend":1095.38,"Total ad spend":1340.24,"Total":10431.72,"New Customer Aq Cost":11.13,"nROAS":4.13,"Net Profit (TW)":5140,"AMAZON MER":54.44,"WEB MER":0,"TOTAL MER":10.5},{"date":"16/12/2024","New Web Customers":18,"New customer revenue":792.62,"nAOV":44.03,"Website":4093.52,"Amazon sales":2312,"Google Ad Spend":170.45,"FB Ad Spend":0,"Amazon ad spend":1282.63,"Total ad spend":1453.08,"Total":6405.52,"New Customer Aq Cost":9.47,"nROAS":4.65,"Net Profit (TW)":2378,"AMAZON MER":55.48,"WEB MER":0,"TOTAL MER":20.02},{"date":"23/12/2024","New Web Customers":32,"New customer revenue":1396.3,"nAOV":43.63,"Website":4323.66,"Amazon sales":1388,"Google Ad Spend":88.01,"FB Ad Spend":1228.03,"Amazon ad spend":787.56,"Total ad spend":2103.6,"Total":5711.66,"New Customer Aq Cost":41.13,"nROAS":1.06,"Net Profit (TW)":1319,"AMAZON MER":56.74,"WEB MER":28.4,"TOTAL MER":35.29},{"date":"30/12/2024","New Web Customers":150,"New customer revenue":5608.92,"nAOV":37.39,"Website":8819.66,"Amazon sales":2244,"Google Ad Spend":186.84,"FB Ad Spend":3719.46,"Amazon ad spend":1046.5,"Total ad spend":4952.8,"Total":11063.66,"New Customer Aq Cost":26.04,"nROAS":1.44,"Net Profit (TW)":1689,"AMAZON MER":46.64,"WEB MER":42.17,"TOTAL MER":43.08},{"date":"06/01/2025","New Web Customers":113,"New customer revenue":4346,"nAOV":38.46,"Website":8393.42,"Amazon sales":2550,"Google Ad Spend":223.58,"FB Ad Spend":3866.19,"Amazon ad spend":1008,"Total ad spend":5097.77,"Total":10943.42,"New Customer Aq Cost":36.19,"nROAS":1.06,"Net Profit (TW)":1169,"AMAZON MER":39.53,"WEB MER":46.06,"TOTAL MER":44.54},{"date":"13/01/2025","New Web Customers":94,"New customer revenue":3752.1,"nAOV":39.66,"Website":7627.06,"Amazon sales":2623.4,"Google Ad Spend":202.33,"FB Ad Spend":3529.85,"Amazon ad spend":923,"Total ad spend":4655.18,"Total":10250.46,"New Customer Aq Cost":39.7,"nROAS":1.01,"Net Profit (TW)":1210,"AMAZON MER":35.18,"WEB MER":46.28,"TOTAL MER":43.44},{"date":"20/01/2025","New Web Customers":112,"New customer revenue":5306.36,"nAOV":47.63,"Website":8348.98,"Amazon sales":2592,"Google Ad Spend":113.02,"FB Ad Spend":3819.76,"Amazon ad spend":878.55,"Total ad spend":4811.33,"Total":10940.98,"New Customer Aq Cost":35.11,"nROAS":1.35,"Net Profit (TW)":1515,"AMAZON MER":33.89,"WEB MER":45.75,"TOTAL MER":42.94},{"date":"27/01/2025","New Web Customers":96,"New customer revenue":3890.4,"nAOV":40.53,"Website":7985.25,"Amazon sales":2160,"Google Ad Spend":178.94,"FB Ad Spend":3717,"Amazon ad spend":917.3,"Total ad spend":4813.24,"Total":10145.25,"New Customer Aq Cost":40.58,"nROAS":1,"Net Profit (TW)":1209,"AMAZON MER":42.47,"WEB MER":46.55,"TOTAL MER":45.68},{"date":"03/02/2025","New Web Customers":106,"New customer revenue":3872.2,"nAOV":36.57,"Website":7978.5,"Amazon sales":2412,"Google Ad Spend":243.8,"FB Ad Spend":4282.27,"Amazon ad spend":1017.58,"Total ad spend":5543.65,"Total":10390.5,"New Customer Aq Cost":42.7,"nROAS":0.86,"Net Profit (TW)":523,"AMAZON MER":42.19,"WEB MER":53.67,"TOTAL MER":51.01},{"date":"10/02/2025","New Web Customers":74,"New customer revenue":2849.04,"nAOV":38.5,"Website":7664.58,"Amazon sales":2448,"Google Ad Spend":224,"FB Ad Spend":3240.78,"Amazon ad spend":928,"Total ad spend":4392.78,"Total":10112.58,"New Customer Aq Cost":46.82,"nROAS":0.82,"Net Profit (TW)":1561,"AMAZON MER":37.91,"WEB MER":42.28,"TOTAL MER":41.22},{"date":"17/02/2025","New Web Customers":74,"New customer revenue":3736.04,"nAOV":50.49,"Website":6865.34,"Amazon sales":1945.8,"Google Ad Spend":212,"FB Ad Spend":2804,"Amazon ad spend":1080,"Total ad spend":4096,"Total":8811.14,"New Customer Aq Cost":40.76,"nROAS":1.24,"Net Profit (TW)":1563,"AMAZON MER":55.5,"WEB MER":40.84,"TOTAL MER":44.08},{"date":"24/02/2025","New Web Customers":98,"New customer revenue":3693.74,"nAOV":37.69,"Website":7887.24,"Amazon sales":2304,"Google Ad Spend":141,"FB Ad Spend":3612.89,"Amazon ad spend":984.81,"Total ad spend":4738.7,"Total":10191.24,"New Customer Aq Cost":38.31,"nROAS":0.98,"Net Profit (TW)":1356,"AMAZON MER":42.74,"WEB MER":45.81,"TOTAL MER":45.11},{"date":"03/03/2025","New Web Customers":105,"New customer revenue":3714.24,"nAOV":35.66,"Website":8671.74,"Amazon sales":2844,"Google Ad Spend":183,"FB Ad Spend":3929.53,"Amazon ad spend":874,"Total ad spend":4986.53,"Total":11515.74,"New Customer Aq Cost":39.17,"nROAS":0.9,"Net Profit (TW)":1448,"AMAZON MER":30.73,"WEB MER":45.31,"TOTAL MER":41.71},{"date":"10/03/2025","New Web Customers":113,"New customer revenue":4062.8,"nAOV":36.19,"Website":8893.48,"Amazon sales":2484,"Google Ad Spend":196.99,"FB Ad Spend":3901,"Amazon ad spend":886.79,"Total ad spend":4984.78,"Total":11377.48,"New Customer Aq Cost":36.27,"nROAS":0.99,"Net Profit (TW)":1592,"AMAZON MER":35.7,"WEB MER":43.86,"TOTAL MER":42.08},{"date":"17/03/2025","New Web Customers":101,"New customer revenue":3781.9,"nAOV":37.44,"Website":7701.92,"Amazon sales":2304,"Google Ad Spend":268.08,"FB Ad Spend":4662,"Amazon ad spend":767,"Total ad spend":5697.08,"Total":10005.92,"New Customer Aq Cost":48.81,"nROAS":0.77,"Net Profit (TW)":34,"AMAZON MER":33.29,"WEB MER":60.53,"TOTAL MER":54.26},{"date":"24/03/2025","New Web Customers":68,"New customer revenue":2471.1,"nAOV":37.28,"Website":6906.87,"Amazon sales":2520,"Google Ad Spend":195,"FB Ad Spend":3609.56,"Amazon ad spend":839.53,"Total ad spend":4644.09,"Total":9426.87,"New Customer Aq Cost":55.95,"nROAS":0.65,"Net Profit (TW)":568,"AMAZON MER":33.31,"WEB MER":52.26,"TOTAL MER":47.2},{"date":"31/03/2025","New Web Customers":57,"New customer revenue":2237,"nAOV":39.25,"Website":7489.46,"Amazon sales":2520,"Google Ad Spend":178,"FB Ad Spend":2150,"Amazon ad spend":774.65,"Total ad spend":3102.65,"Total":10009.46,"New Customer Aq Cost":40.84,"nROAS":0.96,"Net Profit (TW)":2701,"AMAZON MER":30.74,"WEB MER":28.71,"TOTAL MER":29.22},{"date":"07/04/2025","New Web Customers":55,"New customer revenue":2588.4,"nAOV":47.06,"Website":7336.5,"Amazon sales":2160,"Google Ad Spend":156,"FB Ad Spend":2099,"Amazon ad spend":723.95,"Total ad spend":2978.95,"Total":9496.5,"New Customer Aq Cost":41,"nROAS":1.15,"Net Profit (TW)":2994,"AMAZON MER":33.52,"WEB MER":28.61,"TOTAL MER":29.73},{"date":"14/04/2025","New Web Customers":73,"New customer revenue":2557,"nAOV":35.03,"Website":7004.78,"Amazon sales":1836,"Google Ad Spend":131.69,"FB Ad Spend":2888.63,"Amazon ad spend":683.32,"Total ad spend":3703.64,"Total":8840.78,"New Customer Aq Cost":41.37,"nROAS":0.85,"Net Profit (TW)":2066,"AMAZON MER":37.22,"WEB MER":41.24,"TOTAL MER":40.4},{"date":"21/04/2025","New Web Customers":64,"New customer revenue":2232.9,"nAOV":34.89,"Website":6154.5,"Amazon sales":1908,"Google Ad Spend":203.06,"FB Ad Spend":3390.98,"Amazon ad spend":713.74,"Total ad spend":4307.78,"Total":8062.5,"New Customer Aq Cost":56.16,"nROAS":0.62,"Net Profit (TW)":838,"AMAZON MER":37.41,"WEB MER":55.1,"TOTAL MER":50.91},{"date":"28/04/2025","New Web Customers":66,"New customer revenue":2267.4,"nAOV":34.35,"Website":7392.98,"Amazon sales":2124,"Google Ad Spend":186,"FB Ad Spend":2922.76,"Amazon ad spend":617,"Total ad spend":3725.76,"Total":9516.98,"New Customer Aq Cost":47.1,"nROAS":0.73,"Net Profit (TW)":2153,"AMAZON MER":29.05,"WEB MER":39.53,"TOTAL MER":37.19},{"date":"05/05/2025","New Web Customers":73,"New customer revenue":2702.12,"nAOV":37.02,"Website":6061.78,"Amazon sales":1728,"Google Ad Spend":245,"FB Ad Spend":3000,"Amazon ad spend":565,"Total ad spend":3810,"Total":7789.78,"New Customer Aq Cost":44.45,"nROAS":0.83,"Net Profit (TW)":1190,"AMAZON MER":35.71,"WEB MER":49.49,"TOTAL MER":46.43},{"date":"12/05/2025","New Web Customers":93,"New customer revenue":3522.07,"nAOV":37.87,"Website":7750.59,"Amazon sales":1512,"Google Ad Spend":209,"FB Ad Spend":3729,"Amazon ad spend":552.08,"Total ad spend":4490.08,"Total":9262.59,"New Customer Aq Cost":42.34,"nROAS":0.89,"Net Profit (TW)":1588,"AMAZON MER":37.37,"WEB MER":48.11,"TOTAL MER":46.36},{"date":"19/05/2025","New Web Customers":114,"New customer revenue":4326.3,"nAOV":38.49,"Website":8744.19,"Amazon sales":1728,"Google Ad Spend":209,"FB Ad Spend":4301,"Amazon ad spend":643.8,"Total ad spend":5153.8,"Total":10472.19,"New Customer Aq Cost":39.56,"nROAS":0.96,"Net Profit (TW)":1850,"AMAZON MER":31.95,"WEB MER":49.19,"TOTAL MER":46.34},{"date":"26/05/2025","New Web Customers":113,"New customer revenue":3953.8,"nAOV":34.12,"Website":7976.4,"Amazon sales":2161.8,"Google Ad Spend":189,"FB Ad Spend":5153,"Amazon ad spend":721.01,"Total ad spend":6063.01,"Total":10138.2,"New Customer Aq Cost":47.27,"nROAS":0.74,"Net Profit (TW)":405,"AMAZON MER":29.78,"WEB MER":64.6,"TOTAL MER":57.18},{"date":"02/06/2025","New Web Customers":122,"New customer revenue":4413.8,"nAOV":36.18,"Website":8816.1,"Amazon sales":2088,"Google Ad Spend":241.41,"FB Ad Spend":4963.87,"Amazon ad spend":566,"Total ad spend":5771.28,"Total":10904.1,"New Customer Aq Cost":42.67,"nROAS":0.85,"Net Profit (TW)":1374,"AMAZON MER":34.53,"WEB MER":56.3,"TOTAL MER":52.14},{"date":"16/06/2025","New Web Customers":114,"New customer revenue":4311.08,"nAOV":37.82,"Website":9729.47,"Amazon sales":1584,"Google Ad Spend":251,"FB Ad Spend":5154,"Amazon ad spend":603,"Total ad spend":6008,"Total":11313.47,"New Customer Aq Cost":47.41,"nROAS":0.8,"Net Profit (TW)":1808,"AMAZON MER":35.73,"WEB MER":52.97,"TOTAL MER":50.56},{"date":"23/06/2025","New Web Customers":112,"New customer revenue":4147.3,"nAOV":37.03,"Website":8173.43,"Amazon sales":1872,"Google Ad Spend":235,"FB Ad Spend":5206,"Amazon ad spend":531,"Total ad spend":5972,"Total":10045.43,"New Customer Aq Cost":48.58,"nROAS":0.76,"Net Profit (TW)":396,"AMAZON MER":32.21,"WEB MER":63.69,"TOTAL MER":57.83},{"date":"30/06/2025","New Web Customers":99,"New customer revenue":3469.4,"nAOV":35.04,"Website":7613.38,"Amazon sales":2628,"Google Ad Spend":217.37,"FB Ad Spend":4938.53,"Amazon ad spend":547,"Total ad spend":5702.9,"Total":10241.38,"New Customer Aq Cost":52.08,"nROAS":0.67,"Net Profit (TW)":475,"AMAZON MER":20.21,"WEB MER":64.87,"TOTAL MER":53.41},{"date":"07/07/2025","New Web Customers":57,"New customer revenue":2018.37,"nAOV":35.41,"Website":8459.56,"Amazon sales":1188,"Google Ad Spend":218.88,"FB Ad Spend":4719,"Amazon ad spend":542,"Total ad spend":5479.88,"Total":9647.56,"New Customer Aq Cost":86.63,"nROAS":0.41,"Net Profit (TW)":1093,"AMAZON MER":46.04,"WEB MER":55.78,"TOTAL MER":54.58},{"date":"14/07/2025","New Web Customers":36,"New customer revenue":1023.95,"nAOV":28.44,"Website":6466,"Amazon sales":1353,"Google Ad Spend":228,"FB Ad Spend":2030,"Amazon ad spend":660,"Total ad spend":2918,"Total":7819,"New Customer Aq Cost":62.72,"nROAS":0.45,"Net Profit (TW)":2375,"AMAZON MER":40.06,"WEB MER":31.39,"TOTAL MER":32.89},{"date":"21/07/2025","New Web Customers":19,"New customer revenue":721.8,"nAOV":37.99,"Website":5385.1,"Amazon sales":936,"Google Ad Spend":129,"FB Ad Spend":900,"Amazon ad spend":458,"Total ad spend":1487,"Total":6321.1,"New Customer Aq Cost":54.16,"nROAS":0.7,"Net Profit (TW)":2457,"AMAZON MER":70.51,"WEB MER":16.71,"TOTAL MER":24.68},{"date":"28/07/2025","New Web Customers":41,"New customer revenue":1583.18,"nAOV":38.61,"Website":5961.14,"Amazon sales":1188,"Google Ad Spend":161,"FB Ad Spend":2102,"Amazon ad spend":402.32,"Total ad spend":2665.32,"Total":7149.14,"New Customer Aq Cost":55.2,"nROAS":0.7,"Net Profit (TW)":1593,"AMAZON MER":38.55,"WEB MER":35.26,"TOTAL MER":35.81},{"date":"04/08/2025","New Web Customers":45,"New customer revenue":1504.3,"nAOV":33.43,"Website":6315.76,"Amazon sales":1476,"Google Ad Spend":250,"FB Ad Spend":1790,"Amazon ad spend":494,"Total ad spend":2534,"Total":7791.76,"New Customer Aq Cost":45.33,"nROAS":0.74,"Net Profit (TW)":1581,"AMAZON MER":27.26,"WEB MER":28.34,"TOTAL MER":28.14},{"date":"11/08/2025","New Web Customers":45,"New customer revenue":1498.8,"nAOV":33.31,"Website":7074.24,"Amazon sales":1548,"Google Ad Spend":264,"FB Ad Spend":2096,"Amazon ad spend":264,"Total ad spend":2624,"Total":8622.24,"New Customer Aq Cost":52.44,"nROAS":0.64,"Net Profit (TW)":2135,"AMAZON MER":31.91,"WEB MER":29.63,"TOTAL MER":30.04},{"date":"18/08/2025","New Web Customers":48,"New customer revenue":1905.78,"nAOV":39.7,"Website":6339.59,"Amazon sales":468,"Google Ad Spend":274,"FB Ad Spend":1708,"Amazon ad spend":415,"Total ad spend":2397,"Total":6807.59,"New Customer Aq Cost":41.29,"nROAS":0.96,"Net Profit (TW)":2127,"AMAZON MER":56.41,"WEB MER":26.94,"TOTAL MER":28.97},{"date":"25/08/2025","New Web Customers":44,"New customer revenue":2020.4,"nAOV":46.01,"Website":7026,"Amazon sales":1584,"Google Ad Spend":197,"FB Ad Spend":1592,"Amazon ad spend":598,"Total ad spend":2387,"Total":8610,"New Customer Aq Cost":40.66,"nROAS":1.13,"Net Profit (TW)":2803,"AMAZON MER":26.2,"WEB MER":22.66,"TOTAL MER":23.31},{"date":"01/09/2025","New Web Customers":38,"New customer revenue":1580.61,"nAOV":42.31,"Website":6163,"Amazon sales":1152,"Google Ad Spend":205,"FB Ad Spend":1579,"Amazon ad spend":556,"Total ad spend":2340,"Total":7315,"New Customer Aq Cost":46.95,"nROAS":0.89,"Net Profit (TW)":2161,"AMAZON MER":51.91,"WEB MER":25.62,"TOTAL MER":29.76},{"date":"08/09/2025","New Web Customers":44,"New customer revenue":1811.33,"nAOV":41.17,"Website":6250.26,"Amazon sales":1224,"Google Ad Spend":228,"FB Ad Spend":1598,"Amazon ad spend":487.61,"Total ad spend":2313.61,"Total":7474.26,"New Customer Aq Cost":41.5,"nROAS":0.99,"Net Profit (TW)":2229,"AMAZON MER":45.42,"WEB MER":25.57,"TOTAL MER":28.82},{"date":"15/09/2025","New Web Customers":45,"New customer revenue":1814.22,"nAOV":40.32,"Website":6305.48,"Amazon sales":1800,"Google Ad Spend":296,"FB Ad Spend":2249,"Amazon ad spend":296,"Total ad spend":2841,"Total":8105.48,"New Customer Aq Cost":56.56,"nROAS":0.71,"Net Profit (TW)":1582,"AMAZON MER":27.09,"WEB MER":35.67,"TOTAL MER":33.76},{"date":"22/09/2025","New Web Customers":53,"New customer revenue":2136,"nAOV":40.3,"Website":6327.64,"Amazon sales":2136,"Google Ad Spend":389,"FB Ad Spend":2453,"Amazon ad spend":696,"Total ad spend":3538,"Total":8463.64,"New Customer Aq Cost":53.62,"nROAS":0.75,"Net Profit (TW)":1328,"AMAZON MER":13.86,"WEB MER":38.77,"TOTAL MER":32.48},{"date":"29/09/2025","New Web Customers":58,"New customer revenue":2339.2,"nAOV":40.33,"Website":7682.98,"Amazon sales":1080,"Google Ad Spend":326,"FB Ad Spend":2529,"Amazon ad spend":493,"Total ad spend":3348,"Total":8762.98,"New Customer Aq Cost":49.22,"nROAS":0.82,"Net Profit (TW)":2143,"AMAZON MER":64.44,"WEB MER":32.92,"TOTAL MER":36.8},{"date":"06/10/2025","New Web Customers":50,"New customer revenue":2246.7,"nAOV":44.93,"Website":6314.52,"Amazon sales":1476,"Google Ad Spend":287,"FB Ad Spend":2576,"Amazon ad spend":780,"Total ad spend":3643,"Total":7790.52,"New Customer Aq Cost":57.26,"nROAS":0.78,"Net Profit (TW)":1261,"AMAZON MER":33.4,"WEB MER":40.79,"TOTAL MER":39.39},{"date":"13/10/2025","New Web Customers":76,"New customer revenue":2788.5,"nAOV":36.69,"Website":7135.86,"Amazon sales":1296,"Google Ad Spend":202,"FB Ad Spend":3041,"Amazon ad spend":832,"Total ad spend":4075,"Total":8431.86,"New Customer Aq Cost":42.67,"nROAS":0.86,"Net Profit (TW)":1410,"AMAZON MER":60.19,"WEB MER":42.62,"TOTAL MER":45.32},{"date":"20/10/2025","New Web Customers":96,"New customer revenue":3170.5,"nAOV":33.03,"Website":7148.34,"Amazon sales":1440,"Google Ad Spend":303,"FB Ad Spend":3705,"Amazon ad spend":723,"Total ad spend":4731,"Total":8588.34,"New Customer Aq Cost":41.75,"nROAS":0.79,"Net Profit (TW)":654,"AMAZON MER":57.78,"WEB MER":51.83,"TOTAL MER":52.83},{"date":"27/10/2025","New Web Customers":131,"New customer revenue":4874.9,"nAOV":37.21,"Website":10733.17,"Amazon sales":1405.8,"Google Ad Spend":283,"FB Ad Spend":4316,"Amazon ad spend":789,"Total ad spend":5388,"Total":12138.97,"New Customer Aq Cost":35.11,"nROAS":1.06,"Net Profit (TW)":2469,"AMAZON MER":51.43,"WEB MER":40.21,"TOTAL MER":41.51},{"date":"03/11/2025","New Web Customers":137,"New customer revenue":4662.7,"nAOV":34.03,"Website":9343.7,"Amazon sales":1620,"Google Ad Spend":307,"FB Ad Spend":5007,"Amazon ad spend":454.98,"Total ad spend":5768.98,"Total":10963.7,"New Customer Aq Cost":38.79,"nROAS":0.88,"Net Profit (TW)":653,"AMAZON MER":48.7,"WEB MER":53.59,"TOTAL MER":52.87},{"date":"17/11/2025","New Web Customers":123,"New customer revenue":4640.4,"nAOV":37.73,"Website":9811.49,"Amazon sales":1620,"Google Ad Spend":316,"FB Ad Spend":5193,"Amazon ad spend":531.02,"Total ad spend":6040.02,"Total":11431.49,"New Customer Aq Cost":44.79,"nROAS":0.84,"Net Profit (TW)":978,"AMAZON MER":28.09,"WEB MER":52.93,"TOTAL MER":49.41},{"date":"24/11/2025","New Web Customers":87,"New customer revenue":3543.1,"nAOV":40.73,"Website":7639.06,"Amazon sales":1441.8,"Google Ad Spend":303,"FB Ad Spend":3667,"Amazon ad spend":615.22,"Total ad spend":4585.22,"Total":9080.86,"New Customer Aq Cost":45.63,"nROAS":0.89,"Net Profit (TW)":1000,"AMAZON MER":36.83,"WEB MER":48,"TOTAL MER":46.23},{"date":"01/12/2025","New Web Customers":69,"New customer revenue":2422.8,"nAOV":35.11,"Website":7169.67,"Amazon sales":1512,"Google Ad Spend":279,"FB Ad Spend":1556,"Amazon ad spend":669.12,"Total ad spend":2504.12,"Total":8681.67,"New Customer Aq Cost":26.59,"nROAS":1.32,"Net Profit (TW)":2858,"AMAZON MER":40.69,"WEB MER":21.7,"TOTAL MER":25.01},{"date":"08/12/2025","New Web Customers":42,"New customer revenue":1625.9,"nAOV":38.71,"Website":7169.61,"Amazon sales":1512,"Google Ad Spend":302,"FB Ad Spend":1456,"Amazon ad spend":571.24,"Total ad spend":2329.24,"Total":8681.61,"New Customer Aq Cost":41.86,"nROAS":0.92,"Net Profit (TW)":2791,"AMAZON MER":44.25,"WEB MER":20.31,"TOTAL MER":24.48},{"date":"15/12/2025","New Web Customers":40,"New customer revenue":1547.6,"nAOV":38.69,"Website":7485,"Amazon sales":1224,"Google Ad Spend":293,"FB Ad Spend":1446,"Amazon ad spend":355.65,"Total ad spend":2094.65,"Total":8709,"New Customer Aq Cost":43.48,"nROAS":0.89,"Net Profit (TW)":3006,"AMAZON MER":46.67,"WEB MER":19.32,"TOTAL MER":23.16},{"date":"22/12/2025","New Web Customers":48,"New customer revenue":2005,"nAOV":41.77,"Website":6254,"Amazon sales":1728,"Google Ad Spend":282,"FB Ad Spend":1558,"Amazon ad spend":396.37,"Total ad spend":2236.37,"Total":7982,"New Customer Aq Cost":38.33,"nROAS":1.09,"Net Profit (TW)":2066,"AMAZON MER":20.58,"WEB MER":24.91,"TOTAL MER":23.97},{"date":"29/12/2025","New Web Customers":34,"New customer revenue":1888.5,"nAOV":55.54,"Website":2751,"Amazon sales":1008,"Google Ad Spend":257,"FB Ad Spend":1717,"Amazon ad spend":308.33,"Total ad spend":2282.33,"Total":3759,"New Customer Aq Cost":58.06,"nROAS":0.96,"Net Profit (TW)":-16,"AMAZON MER":39.32,"WEB MER":62.41,"TOTAL MER":56.22},{"date":"05/01/2026","New Web Customers":32,"New customer revenue":108.4,"nAOV":3.39,"Website":5151,"Amazon sales":1116,"Google Ad Spend":299,"FB Ad Spend":1528,"Amazon ad spend":355.73,"Total ad spend":2182.73,"Total":6267,"New Customer Aq Cost":57.09,"nROAS":0.06,"Net Profit (TW)":1384,"AMAZON MER":27.63,"WEB MER":29.66,"TOTAL MER":29.3},{"date":"12/01/2026","New Web Customers":50,"New customer revenue":1973.05,"nAOV":39.46,"Website":5530,"Amazon sales":1404,"Google Ad Spend":313,"FB Ad Spend":1788,"Amazon ad spend":403.71,"Total ad spend":2504.71,"Total":6934,"New Customer Aq Cost":42.02,"nROAS":0.94,"Net Profit (TW)":1363,"AMAZON MER":25.34,"WEB MER":32.33,"TOTAL MER":30.92},{"date":"19/01/2026","New Web Customers":72,"New customer revenue":2496.4,"nAOV":34.67,"Website":6829,"Amazon sales":1188,"Google Ad Spend":291,"FB Ad Spend":2705,"Amazon ad spend":387.68,"Total ad spend":3383.68,"Total":8017,"New Customer Aq Cost":41.61,"nROAS":0.83,"Net Profit (TW)":1386,"AMAZON MER":33.98,"WEB MER":39.61,"TOTAL MER":38.78},{"date":"26/01/2026","New Web Customers":102,"New customer revenue":3839.38,"nAOV":37.64,"Website":10601.13,"Amazon sales":1224,"Google Ad Spend":287,"FB Ad Spend":3782,"Amazon ad spend":393.86,"Total ad spend":4462.86,"Total":11825.13,"New Customer Aq Cost":39.89,"nROAS":0.94,"Net Profit (TW)":2270,"AMAZON MER":31.67,"WEB MER":35.68,"TOTAL MER":35.26},{"date":"02/02/2026","New Web Customers":181,"New customer revenue":6443.14,"nAOV":35.6,"Website":12011.62,"Amazon sales":1476,"Google Ad Spend":276,"FB Ad Spend":5289,"Amazon ad spend":376.48,"Total ad spend":5941.48,"Total":13487.62,"New Customer Aq Cost":30.75,"nROAS":1.16,"Net Profit (TW)":2041,"AMAZON MER":26.68,"WEB MER":44.03,"TOTAL MER":42.13},{"date":"09/02/2026","New Web Customers":200,"New customer revenue":6977.26,"nAOV":34.89,"Website":11428,"Amazon sales":1764,"Google Ad Spend":323,"FB Ad Spend":6556,"Amazon ad spend":368,"Total ad spend":7247,"Total":13192,"New Customer Aq Cost":34.4,"nROAS":1.01,"Net Profit (TW)":-257,"AMAZON MER":21.34,"WEB MER":57.37,"TOTAL MER":52.55},{"date":"16/02/2026","New Web Customers":169,"New customer revenue":6099.3,"nAOV":36.09,"Website":10899.34,"Amazon sales":1297.8,"Google Ad Spend":336,"FB Ad Spend":6996,"Amazon ad spend":293.04,"Total ad spend":7625.04,"Total":12197.14,"New Customer Aq Cost":43.38,"nROAS":0.83,"Net Profit (TW)":-246,"AMAZON MER":28.36,"WEB MER":64.19,"TOTAL MER":60.37}]
const RAW_SUBS = [{"date":"2023-02-13","active_subscriptions":78,"net_gained":2},{"date":"2023-02-20","active_subscriptions":80,"net_gained":2},{"date":"2023-02-27","active_subscriptions":75,"net_gained":-5},{"date":"2023-03-06","active_subscriptions":77,"net_gained":2},{"date":"2023-03-13","active_subscriptions":74,"net_gained":-3},{"date":"2023-03-20","active_subscriptions":74,"net_gained":0},{"date":"2023-03-27","active_subscriptions":77,"net_gained":3},{"date":"2023-04-03","active_subscriptions":77,"net_gained":0},{"date":"2023-04-10","active_subscriptions":75,"net_gained":-2},{"date":"2023-04-17","active_subscriptions":75,"net_gained":0},{"date":"2023-04-24","active_subscriptions":79,"net_gained":4},{"date":"2023-05-01","active_subscriptions":97,"net_gained":18},{"date":"2023-05-08","active_subscriptions":101,"net_gained":4},{"date":"2023-05-15","active_subscriptions":103,"net_gained":2},{"date":"2023-05-22","active_subscriptions":105,"net_gained":2},{"date":"2023-05-29","active_subscriptions":104,"net_gained":-1},{"date":"2023-06-05","active_subscriptions":100,"net_gained":-4},{"date":"2023-06-12","active_subscriptions":106,"net_gained":6},{"date":"2023-06-19","active_subscriptions":108,"net_gained":2},{"date":"2023-06-26","active_subscriptions":114,"net_gained":6},{"date":"2023-07-03","active_subscriptions":126,"net_gained":12},{"date":"2023-07-10","active_subscriptions":149,"net_gained":23},{"date":"2023-07-17","active_subscriptions":159,"net_gained":10},{"date":"2023-07-24","active_subscriptions":171,"net_gained":12},{"date":"2023-07-31","active_subscriptions":173,"net_gained":2},{"date":"2023-08-07","active_subscriptions":172,"net_gained":-1},{"date":"2023-08-14","active_subscriptions":175,"net_gained":3},{"date":"2023-08-21","active_subscriptions":170,"net_gained":-5},{"date":"2023-08-28","active_subscriptions":171,"net_gained":1},{"date":"2023-09-04","active_subscriptions":186,"net_gained":15},{"date":"2023-09-11","active_subscriptions":194,"net_gained":8},{"date":"2023-09-18","active_subscriptions":207,"net_gained":13},{"date":"2023-09-25","active_subscriptions":220,"net_gained":13},{"date":"2023-10-02","active_subscriptions":220,"net_gained":0},{"date":"2023-10-09","active_subscriptions":218,"net_gained":-2},{"date":"2023-10-16","active_subscriptions":209,"net_gained":-9},{"date":"2023-10-23","active_subscriptions":219,"net_gained":10},{"date":"2023-10-30","active_subscriptions":244,"net_gained":25},{"date":"2023-11-06","active_subscriptions":257,"net_gained":13},{"date":"2023-11-13","active_subscriptions":263,"net_gained":6},{"date":"2023-11-20","active_subscriptions":281,"net_gained":18},{"date":"2023-11-27","active_subscriptions":276,"net_gained":-5},{"date":"2023-12-04","active_subscriptions":294,"net_gained":18},{"date":"2023-12-11","active_subscriptions":296,"net_gained":2},{"date":"2023-12-18","active_subscriptions":288,"net_gained":-8},{"date":"2023-12-25","active_subscriptions":282,"net_gained":-6},{"date":"2024-01-01","active_subscriptions":267,"net_gained":68},{"date":"2024-01-08","active_subscriptions":261,"net_gained":-6},{"date":"2024-01-15","active_subscriptions":268,"net_gained":7},{"date":"2024-01-22","active_subscriptions":270,"net_gained":2},{"date":"2024-01-29","active_subscriptions":293,"net_gained":23},{"date":"2024-02-05","active_subscriptions":292,"net_gained":-1},{"date":"2024-02-12","active_subscriptions":286,"net_gained":-6},{"date":"2024-02-19","active_subscriptions":305,"net_gained":19},{"date":"2024-02-26","active_subscriptions":327,"net_gained":22},{"date":"2024-03-04","active_subscriptions":332,"net_gained":5},{"date":"2024-03-11","active_subscriptions":330,"net_gained":-2},{"date":"2024-03-18","active_subscriptions":345,"net_gained":15},{"date":"2024-03-25","active_subscriptions":363,"net_gained":18},{"date":"2024-04-01","active_subscriptions":392,"net_gained":29},{"date":"2024-04-08","active_subscriptions":401,"net_gained":9},{"date":"2024-04-15","active_subscriptions":414,"net_gained":13},{"date":"2024-04-22","active_subscriptions":449,"net_gained":35},{"date":"2024-04-29","active_subscriptions":479,"net_gained":30},{"date":"2024-05-06","active_subscriptions":503,"net_gained":24},{"date":"2024-05-13","active_subscriptions":552,"net_gained":49},{"date":"2024-05-20","active_subscriptions":573,"net_gained":21},{"date":"2024-05-27","active_subscriptions":598,"net_gained":25},{"date":"2024-06-03","active_subscriptions":677,"net_gained":79},{"date":"2024-06-10","active_subscriptions":741,"net_gained":64},{"date":"2024-06-17","active_subscriptions":792,"net_gained":51},{"date":"2024-06-24","active_subscriptions":828,"net_gained":36},{"date":"2024-07-01","active_subscriptions":886,"net_gained":58},{"date":"2024-07-08","active_subscriptions":889,"net_gained":3},{"date":"2024-07-15","active_subscriptions":864,"net_gained":-25},{"date":"2024-07-22","active_subscriptions":857,"net_gained":-7},{"date":"2024-07-29","active_subscriptions":872,"net_gained":15},{"date":"2024-08-05","active_subscriptions":883,"net_gained":11},{"date":"2024-08-12","active_subscriptions":900,"net_gained":17},{"date":"2024-08-19","active_subscriptions":928,"net_gained":28},{"date":"2024-08-26","active_subscriptions":931,"net_gained":3},{"date":"2024-09-02","active_subscriptions":984,"net_gained":53},{"date":"2024-09-09","active_subscriptions":988,"net_gained":4},{"date":"2024-09-16","active_subscriptions":999,"net_gained":11},{"date":"2024-09-23","active_subscriptions":1045,"net_gained":46},{"date":"2024-09-30","active_subscriptions":1106,"net_gained":61},{"date":"2024-10-07","active_subscriptions":1088,"net_gained":-18},{"date":"2024-10-14","active_subscriptions":1136,"net_gained":48},{"date":"2024-10-21","active_subscriptions":1169,"net_gained":33},{"date":"2024-10-28","active_subscriptions":1105,"net_gained":-64},{"date":"2024-11-04","active_subscriptions":1055,"net_gained":-50},{"date":"2024-11-11","active_subscriptions":1048,"net_gained":-7},{"date":"2024-11-18","active_subscriptions":1051,"net_gained":3},{"date":"2024-11-25","active_subscriptions":1030,"net_gained":-21},{"date":"2024-12-02","active_subscriptions":1008,"net_gained":-22},{"date":"2024-12-09","active_subscriptions":980,"net_gained":-28},{"date":"2024-12-16","active_subscriptions":955,"net_gained":-25},{"date":"2024-12-23","active_subscriptions":946,"net_gained":-9},{"date":"2025-01-06","active_subscriptions":1060,"net_gained":31},{"date":"2025-01-13","active_subscriptions":1093,"net_gained":33},{"date":"2025-01-20","active_subscriptions":1136,"net_gained":43},{"date":"2025-01-27","active_subscriptions":1170,"net_gained":34},{"date":"2025-02-03","active_subscriptions":1193,"net_gained":23},{"date":"2025-02-10","active_subscriptions":1178,"net_gained":-15},{"date":"2025-02-17","active_subscriptions":1168,"net_gained":-10},{"date":"2025-02-24","active_subscriptions":1172,"net_gained":4},{"date":"2025-03-03","active_subscriptions":1219,"net_gained":47},{"date":"2025-03-10","active_subscriptions":1234,"net_gained":15},{"date":"2025-03-17","active_subscriptions":1243,"net_gained":9},{"date":"2025-03-24","active_subscriptions":1240,"net_gained":-3},{"date":"2025-03-31","active_subscriptions":1243,"net_gained":3},{"date":"2025-04-07","active_subscriptions":1247,"net_gained":4},{"date":"2025-04-14","active_subscriptions":1236,"net_gained":-11},{"date":"2025-04-21","active_subscriptions":1251,"net_gained":15},{"date":"2025-04-28","active_subscriptions":1269,"net_gained":18},{"date":"2025-05-05","active_subscriptions":1233,"net_gained":-36},{"date":"2025-05-12","active_subscriptions":1260,"net_gained":27},{"date":"2025-05-19","active_subscriptions":1325,"net_gained":65},{"date":"2025-05-26","active_subscriptions":1323,"net_gained":-2},{"date":"2025-06-02","active_subscriptions":1368,"net_gained":45},{"date":"2025-06-09","active_subscriptions":1368,"net_gained":0},{"date":"2025-06-16","active_subscriptions":1412,"net_gained":44},{"date":"2025-06-23","active_subscriptions":1431,"net_gained":19},{"date":"2025-06-30","active_subscriptions":1436,"net_gained":5},{"date":"2025-07-07","active_subscriptions":1406,"net_gained":-30},{"date":"2025-07-14","active_subscriptions":1365,"net_gained":-41},{"date":"2025-07-21","active_subscriptions":1344,"net_gained":-21},{"date":"2025-07-28","active_subscriptions":1317,"net_gained":-27},{"date":"2025-08-04","active_subscriptions":1315,"net_gained":-2},{"date":"2025-08-11","active_subscriptions":1281,"net_gained":-34},{"date":"2025-08-18","active_subscriptions":1271,"net_gained":-10},{"date":"2025-08-25","active_subscriptions":1241,"net_gained":-30},{"date":"2025-09-01","active_subscriptions":1225,"net_gained":-16},{"date":"2025-09-08","active_subscriptions":1221,"net_gained":-4},{"date":"2025-09-15","active_subscriptions":1207,"net_gained":-14},{"date":"2025-09-22","active_subscriptions":1209,"net_gained":2},{"date":"2025-09-29","active_subscriptions":1214,"net_gained":5},{"date":"2025-10-06","active_subscriptions":1198,"net_gained":-16},{"date":"2025-10-13","active_subscriptions":1195,"net_gained":-3},{"date":"2025-10-20","active_subscriptions":1208,"net_gained":13},{"date":"2025-10-27","active_subscriptions":1220,"net_gained":12},{"date":"2025-11-03","active_subscriptions":1251,"net_gained":31},{"date":"2025-11-10","active_subscriptions":1268,"net_gained":17},{"date":"2025-11-17","active_subscriptions":1268,"net_gained":0},{"date":"2025-11-24","active_subscriptions":1249,"net_gained":-19},{"date":"2025-12-01","active_subscriptions":1240,"net_gained":-9},{"date":"2025-12-08","active_subscriptions":1230,"net_gained":-10},{"date":"2025-12-15","active_subscriptions":1226,"net_gained":-4},{"date":"2025-12-22","active_subscriptions":1229,"net_gained":3},{"date":"2025-12-29","active_subscriptions":1190,"net_gained":-39},{"date":"2026-01-05","active_subscriptions":1179,"net_gained":-11},{"date":"2026-01-12","active_subscriptions":1179,"net_gained":0},{"date":"2026-01-19","active_subscriptions":1185,"net_gained":6},{"date":"2026-01-26","active_subscriptions":1225,"net_gained":40},{"date":"2026-02-02","active_subscriptions":1270,"net_gained":45},{"date":"2026-02-09","active_subscriptions":1303,"net_gained":33}]

// Date helpers
const parseDate = (s) => {
  if (!s) return new Date(NaN)
  if (s.includes("/")) {
    const [dd, mm, yyyy] = s.split("/").map((x) => Number(x))
    return new Date(yyyy, mm - 1, dd)
  }
  const [yyyy, mm, dd] = s.split("-").map((x) => Number(x))
  return new Date(yyyy, mm - 1, dd)
}

const fmtDate = (s) => {
  const d = parseDate(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

const fmtNum = (n) => {
  if (n == null || Number.isNaN(Number(n))) return "—"
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(Number(n))
}

const fmtGBP = (n) => {
  if (n == null || Number.isNaN(Number(n))) return "—"
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(Number(n))
}

const fmtPct = (n) => {
  if (n == null || Number.isNaN(Number(n))) return "—"
  return `${(Number(n) * 100).toFixed(1)}%`
}

const isFiniteNumber = (v) => typeof v === "number" && Number.isFinite(v)

// Theme
const THEME = {
  bg: "#f6f6f3",
  panel: "#ffffff",
  panel2: "#fbfbf8",
  text: "#0f172a",
  muted: "#475569",
  faint: "#94a3b8",
  border: "#e5e7eb",
  grid: "#eef2f7"
}

const SERIES_COLORS = [
  "#0f172a",
  "#1d4ed8",
  "#0f766e",
  "#b45309",
  "#7c3aed",
  "#be123c",
  "#0369a1",
  "#15803d",
  "#9333ea",
  "#c2410c",
  "#1f2937",
  "#0e7490",
  "#a16207",
  "#166534",
  "#9f1239",
  "#4f46e5",
  "#075985",
  "#7f1d1d",
  "#365314",
  "#1e3a8a",
  "#3f3f46",
  "#334155",
  "#6d28d9",
  "#047857"
]

// Formatting rules
const CURRENCY_KEYS = new Set([
  "New customer revenue",
  "nAOV",
  "Website Revenue",
  "Amazon sales",
  "Google Ad Spend",
  "FB Ad Spend",
  "Amazon ad spend",
  "Total ad spend",
  "Total",
  "New Customer Aq Cost",
  "Net Profit (TW)",
  "Ad Spend (Meta+Google)"
])

const PCT_KEYS = new Set(["AMAZON MER", "WEB MER", "TOTAL MER"])

const formatVal = (key, v) => {
  if (v == null) return "—"
  if (CURRENCY_KEYS.has(key)) return fmtGBP(v)
  if (PCT_KEYS.has(key)) return fmtPct(v)
  if (key === "nROAS") return Number(v).toFixed(2)
  if (key.includes("MER") || key.includes("ROAS") || key.includes("Efficiency")) return Number(v).toFixed(2)
  return fmtNum(v)
}

// Rolling average
const rollingAverage = (rows, keys, windowSize) => {
  const out = []
  for (let i = 0; i < rows.length; i += 1) {
    const start = Math.max(0, i - (windowSize - 1))
    const slice = rows.slice(start, i + 1)
    const next = { ...rows[i] }
    keys.forEach((k) => {
      let sum = 0
      let count = 0
      for (const r of slice) {
        const v = r[k]
        if (isFiniteNumber(v)) {
          sum += v
          count += 1
        }
      }
      next[k] = count ? sum / count : null
    })
    out.push(next)
  }
  return out
}

// Build base weekly rows
const salesData = RAW_SALES
  .map((r) => {
    const google = Number(r["Google Ad Spend"] || 0)
    const meta = Number(r["FB Ad Spend"] || 0)
    const metaGoogleSpend = google + meta

    return {
      ...r,
      "Website Revenue": r["Website"],
      "Ad Spend (Meta+Google)": metaGoogleSpend,
      _ts: parseDate(r.date).getTime(),
      _label: fmtDate(r.date)
    }
  })
  .sort((a, b) => a._ts - b._ts)

const subsData = RAW_SUBS
  .map((r) => ({
    ...r,
    _ts: parseDate(r.date).getTime(),
    _label: fmtDate(r.date)
  }))
  .sort((a, b) => a._ts - b._ts)

// Merge subs onto sales by nearest week within 7 days
const mergedData = salesData.map((s) => {
  const closest = subsData.reduce(
    (best, sub) => {
      const diff = Math.abs(sub._ts - s._ts)
      return diff < best.diff ? { diff, sub } : best
    },
    { diff: Infinity, sub: null }
  )

  const row = { ...s }
  if (closest.sub && closest.diff <= 7 * 86400000) {
    row["Active Subs"] = closest.sub.active_subscriptions
    row["Net Gained Subs"] = closest.sub.net_gained
  } else {
    row["Active Subs"] = null
    row["Net Gained Subs"] = null
  }

  const spend = row["Ad Spend (Meta+Google)"]
  const total = row["Total"]
  row["Efficiency (MER)"] = spend && isFiniteNumber(total) ? total / spend : null

  return row
})

const SALES_METRICS = [
  "New Web Customers",
  "New customer revenue",
  "nAOV",
  "Website Revenue",
  "Amazon sales",
  "Google Ad Spend",
  "FB Ad Spend",
  "Amazon ad spend",
  "Total ad spend",
  "Ad Spend (Meta+Google)",
  "Total",
  "New Customer Aq Cost",
  "nROAS",
  "Net Profit (TW)",
  "AMAZON MER",
  "WEB MER",
  "TOTAL MER",
  "Efficiency (MER)"
]

const SUB_METRICS = ["Active Subs", "Net Gained Subs"]
const ALL_METRICS = [...SALES_METRICS, ...SUB_METRICS]

const METRIC_COLORS = ALL_METRICS.reduce((acc, metric, idx) => {
  acc[metric] = SERIES_COLORS[idx % SERIES_COLORS.length]
  return acc
}, {})

const metricColor = (metric) => METRIC_COLORS[metric] || SERIES_COLORS[0]

const GROUPS = {
  Revenue: ["Website Revenue", "Amazon sales", "Total"],
  "New Customers": ["New Web Customers", "New customer revenue", "nAOV"],
  "Ad Spend": ["Google Ad Spend", "FB Ad Spend", "Ad Spend (Meta+Google)", "Amazon ad spend", "Total ad spend"],
  Efficiency: ["New Customer Aq Cost", "nROAS", "WEB MER", "TOTAL MER", "Efficiency (MER)"],
  Profit: ["Net Profit (TW)"],
  Subscriptions: ["Active Subs", "Net Gained Subs"]
}

const QUICK_VIEWS = [
  {
    label: "Core",
    metrics: ["Total", "Ad Spend (Meta+Google)", "New Web Customers", "New Customer Aq Cost", "Net Profit (TW)", "Active Subs"]
  },
  {
    label: "Revenue",
    metrics: ["Website Revenue", "Amazon sales", "Total", "Net Profit (TW)"]
  },
  {
    label: "Acquisition",
    metrics: ["New Web Customers", "Ad Spend (Meta+Google)", "New Customer Aq Cost", "nROAS", "Efficiency (MER)"]
  },
  {
    label: "Retention",
    metrics: ["Active Subs", "Net Gained Subs", "Total", "Net Profit (TW)"]
  }
]

const KPI_TREND_POLARITY = {
  "Ad Spend (Meta+Google)": "neutral",
  "New Customer Aq Cost": "down"
}

const metricKind = (k) => {
  if (PCT_KEYS.has(k)) return "pct"
  if (CURRENCY_KEYS.has(k)) return "gbp"
  if (k.includes("Subs") || k.includes("Customers")) return "count"
  if (k.includes("ROAS") || k.includes("MER") || k.includes("Efficiency")) return "ratio"
  return "count"
}

const defaultAxisFor = (k) => {
  const kind = metricKind(k)
  if (kind === "gbp") return "left"
  return "right"
}

const axisUnitLabel = (metrics, normalized = false) => {
  if (!metrics.length) return ""
  if (normalized) return "Index (100 baseline)"

  const kinds = new Set(metrics.map((m) => metricKind(m)))
  if (kinds.size === 1) {
    const only = [...kinds][0]
    if (only === "gbp") return "GBP (£)"
    if (only === "count") return "Count"
    if (only === "pct") return "Percent (%)"
    if (only === "ratio") return "Ratio"
  }

  const onlyRatios = [...kinds].every((k) => k === "ratio" || k === "pct")
  if (onlyRatios) return "Ratio / %"

  return "Mixed units"
}

const hasFiniteNonZero = (v) => Number.isFinite(v) && v !== 0

const metricMagnitude = (rows, key) => {
  const values = rows
    .map((row) => Number(row[key]))
    .filter((v) => Number.isFinite(v))
    .map((v) => Math.abs(v))
    .filter((v) => v > 0)

  if (!values.length) return 0

  values.sort((a, b) => a - b)
  return values[Math.floor((values.length - 1) * 0.9)] || values[values.length - 1]
}

const axisPairForPreset = (rows, aKey, bKey) => {
  const magA = metricMagnitude(rows, aKey)
  const magB = metricMagnitude(rows, bKey)

  if (magA > 0 && magB > 0) {
    const ratio = Math.max(magA, magB) / Math.min(magA, magB)
    if (ratio >= 6) {
      return magA >= magB ? { axisA: "left", axisB: "right" } : { axisA: "right", axisB: "left" }
    }
  }

  const defaultA = defaultAxisFor(aKey)
  const defaultB = defaultAxisFor(bKey)

  if (defaultA !== defaultB) return { axisA: defaultA, axisB: defaultB }

  return { axisA: "left", axisB: "left" }
}

const buildAutoAxisMap = (rows, metrics) => {
  const next = {}
  metrics.forEach((metric) => {
    next[metric] = defaultAxisFor(metric)
  })

  const withMagnitude = metrics
    .map((metric) => ({ metric, magnitude: metricMagnitude(rows, metric) }))
    .filter((item) => item.magnitude > 0)

  if (withMagnitude.length < 2) return next

  const spread = Math.max(...withMagnitude.map((item) => Math.log10(item.magnitude))) - Math.min(...withMagnitude.map((item) => Math.log10(item.magnitude)))

  if (spread < 0.8) return next

  const sorted = [...withMagnitude].sort((a, b) => b.magnitude - a.magnitude)
  const splitAt = Math.ceil(sorted.length / 2)

  sorted.forEach((item, idx) => {
    next[item.metric] = idx < splitAt ? "left" : "right"
  })

  return next
}

const findNormalizationBaselineIndex = (rows, metrics, preferredBaseIndex = 0) => {
  if (!rows.length || !metrics.length) return 0

  const startAt = clamp(preferredBaseIndex, 0, rows.length - 1)
  const scoreRow = (row) =>
    metrics.reduce((score, metric) => {
      const v = Number(row?.[metric])
      return score + (hasFiniteNonZero(v) ? 1 : 0)
    }, 0)

  for (let i = startAt; i < rows.length; i += 1) {
    if (scoreRow(rows[i]) === metrics.length) return i
  }

  for (let i = 0; i < startAt; i += 1) {
    if (scoreRow(rows[i]) === metrics.length) return i
  }

  let bestIndex = startAt
  let bestScore = -1
  let bestDistance = Infinity

  for (let i = 0; i < rows.length; i += 1) {
    const score = scoreRow(rows[i])
    const distance = Math.abs(i - startAt)
    if (score > bestScore || (score === bestScore && distance < bestDistance)) {
      bestIndex = i
      bestScore = score
      bestDistance = distance
    }
  }

  return bestIndex
}

const buildNormalizedRows = (rows, metrics, preferredBaseIndex = 0) => {
  if (!rows.length || !metrics.length) return { rows, baseMap: {}, baselineIndex: 0 }

  const baselineIndex = findNormalizationBaselineIndex(rows, metrics, preferredBaseIndex)
  const baselineRow = rows[baselineIndex] || {}
  const baseMap = {}

  metrics.forEach((metric) => {
    const base = Number(baselineRow?.[metric])
    baseMap[metric] = hasFiniteNonZero(base) ? base : null
  })

  const normalizedRows = rows.map((row) => {
    const next = { ...row }
    metrics.forEach((metric) => {
      const current = Number(row?.[metric])
      const base = baseMap[metric]
      next[`__raw__${metric}`] = Number.isFinite(current) ? current : null

      if (!Number.isFinite(current) || !Number.isFinite(base) || base === 0) {
        next[metric] = null
      } else {
        next[metric] = (current / base) * 100
      }
    })
    return next
  })

  return { rows: normalizedRows, baseMap, baselineIndex }
}

const countMissingPoints = (rows, metrics) =>
  rows.reduce((total, row) => {
    let rowMissing = 0
    metrics.forEach((metric) => {
      const v = Number(row?.[metric])
      if (!Number.isFinite(v)) rowMissing += 1
    })
    return total + rowMissing
  }, 0)

const getKpiChangeDisplay = (key, change) => {
  if (change == null) return null

  const polarity = KPI_TREND_POLARITY[key] || "up"
  if (polarity === "neutral") {
    return {
      color: THEME.muted,
      text: `${change >= 0 ? "+" : "−"}${Math.abs(change).toFixed(1)}% WoW`
    }
  }

  const good = polarity === "down" ? change < 0 : change >= 0
  return {
    color: good ? "#16a34a" : "#dc2626",
    text: `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(1)}% WoW`
  }
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

const PresetMiniChart = ({ title, data, aKey, bKey, axisA, axisB }) => {
  const colorA = metricColor(aKey)
  const colorB = metricColor(bKey)
  const showRightAxis = axisA === "right" || axisB === "right"

  const tooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div
        style={{
          background: THEME.panel,
          border: `1px solid ${THEME.border}`,
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: 12,
          color: THEME.text,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)"
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: 6, color: THEME.text }}>{label}</div>
        {payload
          .filter((p) => p.value != null)
          .map((p) => (
            <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <span style={{ color: THEME.muted }}>{p.dataKey}</span>
              <span style={{ fontWeight: 800, color: THEME.text }}>{formatVal(p.dataKey, p.value)}</span>
            </div>
          ))}
      </div>
    )
  }

  return (
    <div
      style={{
        background: THEME.panel,
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: 14
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 950, marginBottom: 8, color: THEME.text }}>{title}</div>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 8, right: showRightAxis ? 26 : 10, left: 10, bottom: 8 }}>
            <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
            <XAxis dataKey="_label" tick={{ fontSize: 11, fill: THEME.muted }} minTickGap={56} interval="preserveStartEnd" />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: THEME.muted }} />
            {showRightAxis ? <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: THEME.muted }} /> : null}
            <Tooltip content={tooltip} />
            <Line yAxisId={axisA} type="monotone" dataKey={aKey} stroke={colorA} strokeWidth={2.4} dot={false} />
            <Line yAxisId={axisB} type="monotone" dataKey={bKey} stroke={colorB} strokeWidth={2.4} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 11, color: THEME.muted, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: colorA, display: "inline-block" }} />
          {aKey}
        </span>
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: colorB, display: "inline-block" }} />
          {bKey}
        </span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [visible, setVisible] = useState(() => new Set(["Website Revenue", "Amazon sales", "Total", "Active Subs"]))
  const [chartType, setChartType] = useState("line")
  const [hoveredGroup, setHoveredGroup] = useState(null)

  const [useRolling, setUseRolling] = useState(false)
  const [windowSize, setWindowSize] = useState(4)
  const [normalizeMetrics, setNormalizeMetrics] = useState(false)

  const [axisMap, setAxisMap] = useState(() => {
    const m = {}
    ALL_METRICS.forEach((k) => {
      m[k] = defaultAxisFor(k)
    })
    return m
  })

  const [brushRange, setBrushRange] = useState(() => {
    const len = mergedData.length
    const startIndex = Math.max(0, len - 30)
    return { startIndex, endIndex: len - 1 }
  })

  const toggleMetric = (m) => {
    setVisible((prev) => {
      const next = new Set(prev)
      if (next.has(m)) next.delete(m)
      else next.add(m)
      return next
    })
  }

  const toggleGroup = (g) => {
    const keys = GROUPS[g]
    const allOn = keys.every((k) => visible.has(k))
    setVisible((prev) => {
      const next = new Set(prev)
      keys.forEach((k) => {
        if (allOn) next.delete(k)
        else next.add(k)
      })
      return next
    })
  }

  const displayedData = useMemo(() => {
    if (!useRolling) return mergedData
    return rollingAverage(mergedData, ALL_METRICS, windowSize)
  }, [useRolling, windowSize])

  useEffect(() => {
    setBrushRange((r) => {
      const len = displayedData.length
      const startIndex = clamp(r.startIndex, 0, Math.max(0, len - 1))
      const endIndex = clamp(r.endIndex, startIndex, Math.max(0, len - 1))
      return { startIndex, endIndex }
    })
  }, [displayedData.length])

  const rangedData = useMemo(() => {
    const { startIndex, endIndex } = brushRange
    return displayedData.slice(startIndex, endIndex + 1)
  }, [displayedData, brushRange])

  const rangeStartTs = rangedData[0]?._ts ?? displayedData[0]?._ts
  const rangeEndTs = rangedData[rangedData.length - 1]?._ts ?? displayedData[displayedData.length - 1]?._ts

  const rangedSubsData = useMemo(() => {
    if (!rangeStartTs || !rangeEndTs) return subsData
    return subsData.filter((r) => r._ts >= rangeStartTs - 7 * 86400000 && r._ts <= rangeEndTs + 7 * 86400000)
  }, [rangeStartTs, rangeEndTs])

  const visibleMetrics = useMemo(() => ALL_METRICS.filter((m) => visible.has(m)), [visible])

  const leftMetrics = visibleMetrics.filter((m) => axisMap[m] === "left")
  const rightMetrics = visibleMetrics.filter((m) => axisMap[m] === "right")

  const normalized = useMemo(() => {
    if (!normalizeMetrics) return { rows: displayedData, baseMap: {}, baselineIndex: brushRange.startIndex }
    return buildNormalizedRows(displayedData, visibleMetrics, brushRange.startIndex)
  }, [normalizeMetrics, displayedData, visibleMetrics, brushRange.startIndex])

  const mainChartData = normalizeMetrics ? normalized.rows : displayedData
  const normalizedUnavailable = normalizeMetrics ? visibleMetrics.filter((m) => !Number.isFinite(normalized.baseMap[m])) : []
  const normalizationBaseLabel = displayedData[normalized.baselineIndex]?._label
  const missingPointCount = useMemo(() => countMissingPoints(rangedData, visibleMetrics), [rangedData, visibleMetrics])
  const leftAxisLabel = axisUnitLabel(normalizeMetrics ? visibleMetrics : leftMetrics, normalizeMetrics)
  const rightAxisLabel = normalizeMetrics ? "" : axisUnitLabel(rightMetrics, false)
  const canUseBarMode = visibleMetrics.length <= 3

  const autoBalanceAxes = () => {
    if (!visibleMetrics.length) return
    const next = buildAutoAxisMap(rangedData, visibleMetrics)
    setAxisMap((prevMap) => ({ ...prevMap, ...next }))
  }

  useEffect(() => {
    if (chartType === "bar" && !canUseBarMode) {
      setChartType("line")
    }
  }, [chartType, canUseBarMode])

  const latest = rangedData[rangedData.length - 1] || displayedData[displayedData.length - 1]
  const prev = rangedData[rangedData.length - 2] || displayedData[displayedData.length - 2]

  const wow = (curr, previous) => {
    if (curr == null || previous == null || previous === 0) return null
    return ((curr - previous) / Math.abs(previous)) * 100
  }

  const kpis = [
    { label: "Total revenue", key: "Total" },
    { label: "Website revenue", key: "Website Revenue" },
    { label: "Amazon", key: "Amazon sales" },
    { label: "Meta + Google spend", key: "Ad Spend (Meta+Google)" },
    { label: "New customers", key: "New Web Customers" },
    { label: "CAC", key: "New Customer Aq Cost" },
    { label: "Net profit", key: "Net Profit (TW)" },
    { label: "Active subs", key: "Active Subs" }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    const hasNormalizedPayload = payload.some((p) => p?.payload && p.payload[`__raw__${p.dataKey}`] != null)
    return (
      <div
        style={{
          background: THEME.panel,
          border: `1px solid ${THEME.border}`,
          borderRadius: 12,
          padding: "10px 12px",
          fontSize: 12,
          color: THEME.text,
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)"
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 8 }}>{label}</div>
        {payload
          .filter((p) => p.value != null)
          .map((p) => (
            <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 18, padding: "2px 0" }}>
              <span style={{ color: THEME.muted }}>{p.dataKey}</span>
              <span style={{ fontWeight: 900 }}>
                {normalizeMetrics && hasNormalizedPayload
                  ? `${Number(p.value).toFixed(1)} index${Number.isFinite(Number(p.payload?.[`__raw__${p.dataKey}`])) ? ` · ${formatVal(p.dataKey, p.payload[`__raw__${p.dataKey}`])}` : ""}`
                  : formatVal(p.dataKey, p.value)}
              </span>
            </div>
          ))}
      </div>
    )
  }

  const axisSelect = (metric) => (
    <select
      value={axisMap[metric]}
      onChange={(e) => {
        const v = e.target.value
        setAxisMap((prevMap) => ({ ...prevMap, [metric]: v }))
      }}
      disabled={normalizeMetrics}
      style={{
        border: `1px solid ${THEME.border}`,
        borderRadius: 10,
        padding: "7px 9px",
        fontSize: 12,
        background: THEME.panel,
        color: THEME.text,
        width: "100%",
        opacity: normalizeMetrics ? 0.55 : 1
      }}
    >
      <option value="left">Left axis</option>
      <option value="right">Right axis</option>
    </select>
  )

  const presets = useMemo(() => {
    const spend = "Ad Spend (Meta+Google)"
    const efficiency = "Efficiency (MER)"
    const list = [
      { title: "Ad spend vs CAC", aKey: spend, bKey: "New Customer Aq Cost" },
      { title: "Ad spend vs New customers", aKey: spend, bKey: "New Web Customers" },
      { title: "Ad spend vs Subscribers", aKey: spend, bKey: "Active Subs" },
      { title: "Ad spend vs Revenue", aKey: spend, bKey: "Total" },
      { title: "Net profit vs Revenue", aKey: "Net Profit (TW)", bKey: "Total" },
      { title: "Ad spend vs Net profit", aKey: spend, bKey: "Net Profit (TW)" },
      { title: "Active subs vs Net profit", aKey: "Active Subs", bKey: "Net Profit (TW)" },
      { title: "Ad spend vs Efficiency", aKey: spend, bKey: efficiency },
      { title: "Active subs vs Efficiency", aKey: "Active Subs", bKey: efficiency },
      { title: "Ad spend vs Amazon sales", aKey: spend, bKey: "Amazon sales" },
      { title: "Ad spend vs Net gained subs", aKey: spend, bKey: "Net Gained Subs" },

      { title: "Website revenue vs New customers", aKey: "Website Revenue", bKey: "New Web Customers" },
      { title: "Website revenue vs CAC", aKey: "Website Revenue", bKey: "New Customer Aq Cost" },
      { title: "Total revenue vs Active subs", aKey: "Total", bKey: "Active Subs" },
      { title: "Amazon sales vs Amazon ad spend", aKey: "Amazon sales", bKey: "Amazon ad spend" },
      { title: "Meta + Google spend vs Website revenue", aKey: spend, bKey: "Website Revenue" }
    ]

    return list.map((p) => ({
      ...p,
      ...axisPairForPreset(rangedData, p.aKey, p.bKey)
    }))
  }, [rangedData])

  return (
    <div
      style={{
        background: THEME.bg,
        color: THEME.text,
        minHeight: "100vh",
        fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial",
        padding: "22px 22px 40px"
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 950, letterSpacing: "-0.02em" }}>Weekly Performance Dashboard</div>
              <div style={{ fontSize: 13, color: THEME.muted, marginTop: 4 }}>
                {fmtDate(salesData[0].date)} to {fmtDate(salesData[salesData.length - 1].date)} · {salesData.length} weeks
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 13, color: THEME.muted }}>
                <input type="checkbox" checked={useRolling} onChange={(e) => setUseRolling(e.target.checked)} />
                4 week rolling average
              </label>

              <label style={{ display: "inline-flex", gap: 8, alignItems: "center", fontSize: 13, color: THEME.muted }}>
                <input type="checkbox" checked={normalizeMetrics} onChange={(e) => setNormalizeMetrics(e.target.checked)} />
                Normalize metrics (index = 100)
              </label>

              <select
                value={windowSize}
                onChange={(e) => setWindowSize(Number(e.target.value))}
                disabled={!useRolling}
                style={{
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 12,
                  padding: "8px 10px",
                  fontSize: 13,
                  background: THEME.panel,
                  color: THEME.text,
                  opacity: useRolling ? 1 : 0.5
                }}
              >
                <option value={4}>4 weeks</option>
                <option value={6}>6 weeks</option>
                <option value={8}>8 weeks</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 18 }}>
          {kpis.map((k) => {
            const val = latest?.[k.key]
            const change = wow(val, prev?.[k.key])
            const changeDisplay = getKpiChangeDisplay(k.key, change)
            return (
              <div
                key={k.key}
                style={{
                  background: THEME.panel,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: 18,
                  padding: "14px 14px",
                  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.05)"
                }}
              >
                <div style={{ fontSize: 11, color: THEME.muted, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 800 }}>{k.label}</div>
                <div style={{ fontSize: 20, fontWeight: 950, marginTop: 6 }}>{formatVal(k.key, val)}</div>
                {changeDisplay ? (
                  <div style={{ fontSize: 12, marginTop: 6, color: changeDisplay.color, fontWeight: 900 }}>{changeDisplay.text}</div>
                ) : (
                  <div style={{ fontSize: 12, marginTop: 6, color: THEME.faint }}> </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <div style={{ fontWeight: 950 }}>Metric groups</div>
              <button
                onClick={() => setVisible(new Set())}
                style={{
                  border: `1px solid ${THEME.border}`,
                  background: THEME.panel2,
                  borderRadius: 12,
                  padding: "7px 10px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: THEME.muted,
                  fontWeight: 900
                }}
              >
                Clear
              </button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: THEME.muted, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                Quick Views
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {QUICK_VIEWS.map((view) => {
                  const active = visible.size === view.metrics.length && view.metrics.every((metric) => visible.has(metric))
                  return (
                    <button
                      key={view.label}
                      onClick={() => setVisible(new Set(view.metrics))}
                      style={{
                        border: `1px solid ${THEME.border}`,
                        background: active ? THEME.text : THEME.panel2,
                        borderRadius: 999,
                        padding: "6px 10px",
                        cursor: "pointer",
                        fontSize: 12,
                        color: active ? THEME.bg : THEME.text,
                        fontWeight: 900
                      }}
                    >
                      {view.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.keys(GROUPS).map((g) => {
                const keys = GROUPS[g]
                const allOn = keys.every((k) => visible.has(k))
                const someOn = keys.some((k) => visible.has(k))
                return (
                  <button
                    key={g}
                    onClick={() => toggleGroup(g)}
                    onMouseEnter={() => setHoveredGroup(g)}
                    onMouseLeave={() => setHoveredGroup(null)}
                    style={{
                      border: `1px solid ${THEME.border}`,
                      background: allOn ? THEME.text : someOn ? THEME.panel2 : THEME.panel,
                      borderRadius: 999,
                      padding: "7px 10px",
                      cursor: "pointer",
                      fontSize: 13,
                      color: allOn ? THEME.bg : THEME.text,
                      fontWeight: 950
                    }}
                  >
                    {g}
                  </button>
                )
              })}
            </div>

            {hoveredGroup ? (
              <div style={{ marginTop: 10, fontSize: 12, color: THEME.muted }}>{GROUPS[hoveredGroup].join(" · ")}</div>
            ) : null}

            <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ALL_METRICS.map((m) => {
                const on = visible.has(m)
                const c = metricColor(m)
                return (
                  <button
                    key={m}
                    onClick={() => toggleMetric(m)}
                    style={{
                      border: `1px solid ${on ? c : THEME.border}`,
                      background: on ? `${c}14` : "transparent",
                      borderRadius: 12,
                      padding: "6px 9px",
                      cursor: "pointer",
                      fontSize: 12,
                      color: on ? THEME.text : THEME.muted,
                      fontWeight: 900
                    }}
                  >
                    {m}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, padding: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontWeight: 950 }}>Active series</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["line", "bar", "area"].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      if (t === "bar" && !canUseBarMode) return
                      setChartType(t)
                    }}
                    disabled={t === "bar" && !canUseBarMode}
                    style={{
                      border: `1px solid ${THEME.border}`,
                      background: chartType === t ? THEME.text : THEME.panel2,
                      borderRadius: 12,
                      padding: "7px 10px",
                      cursor: t === "bar" && !canUseBarMode ? "not-allowed" : "pointer",
                      fontSize: 13,
                      color: chartType === t ? THEME.bg : THEME.text,
                      fontWeight: 950,
                      textTransform: "capitalize",
                      opacity: t === "bar" && !canUseBarMode ? 0.45 : 1
                    }}
                  >
                    {t}
                  </button>
                ))}
                <button
                  onClick={autoBalanceAxes}
                  disabled={normalizeMetrics || !visibleMetrics.length}
                  style={{
                    border: `1px solid ${THEME.border}`,
                    background: THEME.panel2,
                    borderRadius: 12,
                    padding: "7px 10px",
                    cursor: normalizeMetrics || !visibleMetrics.length ? "not-allowed" : "pointer",
                    fontSize: 13,
                    color: THEME.text,
                    fontWeight: 900,
                    opacity: normalizeMetrics || !visibleMetrics.length ? 0.55 : 1
                  }}
                >
                  Auto-balance axes
                </button>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {visibleMetrics.length ? (
                visibleMetrics.map((m) => {
                  const c = metricColor(m)
                  return (
                    <div key={m} style={{ display: "grid", gridTemplateColumns: "1fr 150px", gap: 10, alignItems: "center" }}>
                      <div style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: "inline-block" }} />
                        <div style={{ fontSize: 13, fontWeight: 950 }}>{m}</div>
                      </div>
                      {axisSelect(m)}
                    </div>
                  )
                })
              ) : (
                <div style={{ fontSize: 13, color: THEME.muted }}>Select metrics to plot</div>
              )}
            </div>

            <div style={{ marginTop: 12, fontSize: 12, color: THEME.muted }}>
              {normalizeMetrics ? "Normalization is on, so all active metrics share one index scale." : "Tip: put currency on the left axis and counts or ratios on the right axis"}
            </div>
            {!canUseBarMode ? <div style={{ marginTop: 6, fontSize: 12, color: THEME.muted }}>Bar mode is limited to 3 active metrics for readability.</div> : null}
          </div>
        </div>

        <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, padding: 14, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 950, marginBottom: 8 }}>Time series</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11, color: THEME.muted, marginBottom: 8 }}>
            <span style={{ background: THEME.panel2, border: `1px solid ${THEME.border}`, borderRadius: 999, padding: "3px 8px" }}>
              Left axis: {leftAxisLabel || "—"}
            </span>
            {!normalizeMetrics && rightMetrics.length ? (
              <span style={{ background: THEME.panel2, border: `1px solid ${THEME.border}`, borderRadius: 999, padding: "3px 8px" }}>
                Right axis: {rightAxisLabel || "—"}
              </span>
            ) : null}
          </div>

          <div style={{ width: "100%", height: 420 }}>
            <ResponsiveContainer>
              <ComposedChart data={mainChartData} margin={{ top: 8, right: 46, left: 10, bottom: 8 }}>
                <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
                <XAxis dataKey="_label" tick={{ fontSize: 11, fill: THEME.muted }} minTickGap={70} interval="preserveStartEnd" />

                {visibleMetrics.length ? (
                  <YAxis
                    yAxisId="left"
                    label={
                      leftAxisLabel
                        ? { value: leftAxisLabel, angle: -90, position: "insideLeft", offset: 2, fill: THEME.muted, fontSize: 11 }
                        : undefined
                    }
                    tick={{ fontSize: 11, fill: THEME.muted }}
                    tickFormatter={(v) => {
                      if (!isFiniteNumber(v)) return ""
                      if (normalizeMetrics) return `${Math.round(v)}`
                      if (v >= 1000) return `£${(v / 1000).toFixed(0)}k`
                      return v
                    }}
                  />
                ) : null}

                {!normalizeMetrics && rightMetrics.length ? (
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={
                      rightAxisLabel
                        ? { value: rightAxisLabel, angle: 90, position: "insideRight", offset: 2, fill: THEME.muted, fontSize: 11 }
                        : undefined
                    }
                    tick={{ fontSize: 11, fill: THEME.muted }}
                  />
                ) : null}

                <Tooltip content={CustomTooltip} />

                {visibleMetrics.map((m) => {
                  const color = metricColor(m)
                  const yId = normalizeMetrics ? "left" : axisMap[m] || "left"

                  if (chartType === "bar") return <Bar key={m} yAxisId={yId} dataKey={m} fill={color} fillOpacity={0.6} />

                  if (chartType === "area")
                    return (
                      <Area key={m} yAxisId={yId} type="monotone" dataKey={m} stroke={color} fill={color} fillOpacity={0.12} strokeWidth={2} dot={false} />
                    )

                  return <Line key={m} yAxisId={yId} type="monotone" dataKey={m} stroke={color} strokeWidth={2.5} dot={false} />
                })}

                {normalizeMetrics ? <ReferenceLine yAxisId="left" y={100} stroke={THEME.border} strokeDasharray="4 4" /> : null}

                <Brush
                  dataKey="_label"
                  height={28}
                  stroke={THEME.border}
                  fill={THEME.panel2}
                  travellerWidth={10}
                  startIndex={brushRange.startIndex}
                  endIndex={brushRange.endIndex}
                  onChange={(r) => {
                    if (!r) return
                    const startIndex = r.startIndex ?? brushRange.startIndex
                    const endIndex = r.endIndex ?? brushRange.endIndex
                    setBrushRange({ startIndex, endIndex })
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: THEME.muted }}>
            {normalizeMetrics
              ? `Normalized to index 100 from ${normalizationBaseLabel || "the selected baseline week"} (same baseline for all active metrics).`
              : "Date range stays fixed when you change metrics"}
            {normalizeMetrics && normalizedUnavailable.length
              ? ` ${normalizedUnavailable.length} metric${normalizedUnavailable.length > 1 ? "s are" : " is"} hidden because no non-zero baseline was found.`
              : ""}
            {!normalizeMetrics && missingPointCount ? ` ${missingPointCount} missing data point${missingPointCount > 1 ? "s are" : " is"} shown as line breaks.` : ""}
          </div>
        </div>

        <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, padding: 14, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 950, marginBottom: 8 }}>Subscriptions</div>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <ComposedChart data={rangedSubsData} margin={{ top: 8, right: 46, left: 10, bottom: 8 }}>
                <CartesianGrid stroke={THEME.grid} strokeDasharray="3 3" />
                <XAxis dataKey="_label" tick={{ fontSize: 11, fill: THEME.muted }} minTickGap={80} interval="preserveStartEnd" />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: THEME.muted }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: THEME.muted }} />
                <Tooltip content={CustomTooltip} />
                <Area yAxisId="left" type="monotone" dataKey="active_subscriptions" stroke={metricColor("Active Subs")} fill={metricColor("Active Subs")} fillOpacity={0.12} strokeWidth={2.5} dot={false} />
                <Bar yAxisId="right" dataKey="net_gained" fill={metricColor("Net Gained Subs")} fillOpacity={0.55} />
                <ReferenceLine yAxisId="right" y={0} stroke={THEME.border} strokeDasharray="4 4" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <details style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, padding: 14, boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)", marginBottom: 14 }}>
          <summary style={{ cursor: "pointer", fontWeight: 950, fontSize: 14 }}>
            Preset charts <span style={{ fontWeight: 700, fontSize: 12, color: THEME.muted, marginLeft: 10 }}>Click to show</span>
          </summary>

          <div style={{ marginTop: 12, fontSize: 12, color: THEME.muted }}>All Ad spend presets use Meta + Google only</div>

          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
            {presets.map((p) => (
              <PresetMiniChart key={p.title} title={p.title} data={rangedData} aKey={p.aKey} bKey={p.bKey} axisA={p.axisA} axisB={p.axisB} />
            ))}
          </div>
        </details>

        <div style={{ background: THEME.panel, border: `1px solid ${THEME.border}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)" }}>
          <div style={{ padding: "14px 14px 10px", fontWeight: 950 }}>Last 12 weeks (within selected range)</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderTop: `1px solid ${THEME.border}`, borderBottom: `1px solid ${THEME.border}`, background: THEME.panel2 }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", color: THEME.muted, fontWeight: 950, position: "sticky", left: 0, background: THEME.panel2 }}>
                    Week
                  </th>
                  {["Total", "Website Revenue", "Amazon sales", "New Web Customers", "Ad Spend (Meta+Google)", "Net Profit (TW)", "nROAS", "Active Subs"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "right", color: THEME.muted, fontWeight: 950, whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rangedData
                  .slice(-12)
                  .reverse()
                  .map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                      <td style={{ padding: "9px 12px", textAlign: "left", color: THEME.text, fontWeight: 950, position: "sticky", left: 0, background: THEME.panel }}>
                        {row._label}
                      </td>
                      {["Total", "Website Revenue", "Amazon sales", "New Web Customers", "Ad Spend (Meta+Google)", "Net Profit (TW)", "nROAS", "Active Subs"].map((k) => (
                        <td key={k} style={{ padding: "9px 12px", textAlign: "right", color: THEME.text, fontVariantNumeric: "tabular-nums", fontWeight: 850 }}>
                          {formatVal(k, row[k])}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
