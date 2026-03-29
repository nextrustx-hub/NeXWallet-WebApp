// Crypto currencies/networks for deposit & withdrawal
export const cryptoNetworks = [
  { value: "BTC", label: "Bitcoin", sublabel: "Bitcoin", icon: "\u20BF", color: "text-orange-500" },
  { value: "ETH", label: "Ethereum", sublabel: "ERC-20", icon: "\u039E", color: "text-blue-400" },
  { value: "LTC", label: "Litecoin", sublabel: "Litecoin", icon: "\u00A3", color: "text-gray-400" },
  { value: "XMR", label: "Monero", sublabel: "Monero", icon: "\u04BC", color: "text-orange-600" },
] as const;

// USDT network options (user picks one via RadioGroup)
export const usdtNetworks = [
  { value: "USDTTRC20", label: "TRC-20", sublabel: "Tron Network", fee: "Baixa" },
  { value: "USDTBEP20", label: "BEP-20", sublabel: "BSC Network", fee: "Média" },
  { value: "USDTERC20", label: "ERC-20", sublabel: "Ethereum", fee: "Alta" },
] as const;
