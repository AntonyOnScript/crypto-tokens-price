<script setup>
import { onMounted, reactive } from 'vue'
import { http } from '@/services/httpClient'
import { Token } from '@/composables/Token.js'

const tokenPrices = reactive({
  bitcoin: new Token('Bitcoin'),
  dacxi: new Token('Dacxi'),
  ethereum: new Token('Ethereum'),
  cosmos: new Token('Atom'),
  'terra-luna': new Token('Luna')
})

const getTokensPrice = async () => {
  try {
    const { data } = await http.get('simple/price?ids=bitcoin%2Cethereum%2Cdacxi%2Ccosmos%2Cterra-luna&vs_currencies=usd&precision=6')
    const tokensNames = Object.keys(data)
    const tokensPrices = Object.values(data)
    tokensPrices.forEach(({ usd: usdPrice }, tokenIndex) => {
      const currentToken = tokensNames[tokenIndex]
      tokenPrices[currentToken].price = usdPrice
    })
    setTimeout(() => {
      getTokensPrice()
    }, 2000)
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  getTokensPrice()
})
</script>

<template>
  <div>
    <div
      v-for="(crypto, index) in tokenPrices"
      :key="`${crypto.name}-${index}`"
    >
      {{ crypto.name }} - {{ crypto.price }} (USD)
    </div>
  </div>
</template>

<style scoped>
</style>
