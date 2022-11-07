<script setup>
import { onMounted, reactive, ref, computed, watch } from 'vue'
import { http } from '@/services/httpClient'
import { Token } from '@/composables/Token.js'
import { format } from 'date-fns'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const tokenPrices = reactive({
  bitcoin: new Token('Bitcoin'),
  dacxi: new Token('Dacxi'),
  ethereum: new Token('Ethereum'),
  cosmos: new Token('Atom'),
  'terra-luna': new Token('Luna')
})

const loadings = reactive({
  isFetchingInitialTokens: true,
  isFetchingTokenOnDate: false
})

const selectedDate = ref('')
const selectedDatePrice = ref('')
const selectedToken = ref('none')

const canShowDateInput = computed(() => {
  if (selectedToken.value === 'none') {
    return false
  }
  return true
})

const canShowDatePrice = computed(() => {
  if (
    canShowDateInput.value && 
    selectedDate.value && 
    !loadings.isFetchingTokenOnDate
  ) {
    return true
  }
  return false
})

const getTokensPrice = async () => {
  try {
    const tokensNamesParam = Object.keys(tokenPrices).join('%2C')
    const { data } = await http.get(`simple/price?ids=${tokensNamesParam}&vs_currencies=usd&precision=6`)
    const tokensNames = Object.keys(data)
    const tokensPrices = Object.values(data)
    tokensPrices.forEach(({ usd: usdPrice }, tokenIndex) => {
      const currentToken = tokensNames[tokenIndex]
      tokenPrices[currentToken].price = usdPrice
    })
  } catch (error) {
    console.error(error)
  }
  setTimeout(() => {
    getTokensPrice()
  }, 2000)
}

const getTokenPriceInSpecificDate = async (tokenName, date) => {
  loadings.isFetchingTokenOnDate = true
  try {
    let tokenId = ''
    Object.values(tokenPrices).forEach(({ name }, index) => {
      if (tokenName === name) {
        tokenId = Object.keys(tokenPrices)[index]
      }
    })
    const { data } = await http.get(`coins/${tokenId}/history?date=${date}`)
    const { usd: usdPrice } = data.market_data.current_price
    selectedDatePrice.value = usdPrice.toFixed(6)
  } catch(error) {
    console.error(error)
  }
  loadings.isFetchingTokenOnDate = false
}

const handleGetDataFromDate = () => {
  if (selectedDate.value) {
    getTokenPriceInSpecificDate(selectedToken.value, format(selectedDate.value, 'dd-MM-yyyy'))
  }
}

onMounted(async () => {
  loadings.isFetchingInitialTokens = true
  await getTokensPrice()
  loadings.isFetchingInitialTokens = false
})

watch(selectedToken, (value) => {
  if (value !== 'none' && selectedDate.value) {
    handleGetDataFromDate()
  }
})
</script>

<template>
  <div
    v-if="!loadings.isFetchingInitialTokens"
    class="mx-3 my-3"
  >
    <div
      v-for="(token, index) in tokenPrices"
      :key="`${token.name}-${index}`"
    >
      {{ token.name }} - ${{ token.price }} (USD)
    </div>
    <hr class="my-5" />
    <label
      for="tokens"
      class="block mb-3 text-sm font-medium text-gray-900 dark:text-gray-400"
    >Select a token to get price of especific date</label>
    <select
      id="tokens"
      v-model="selectedToken"
      class="bg-white border border-gray-300 text-gray-900 text-sm rounded focus:outline-none hover:border-gray-400 focus:border-gray-400 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option 
        value="none"
        selected
      >
        Choose a token
      </option>
      <option
        v-for="(token, index) in tokenPrices"
        :key="`${token.name}-${index}`"
        :value="token.name"
      >
        {{ token.name }}
      </option>
    </select>
    <Datepicker
      v-if="canShowDateInput"
      v-model="selectedDate"
      placeholder="Select a date"
      :enableTimePicker="false"
      :autoApply="true"
      :maxDate="new Date()"
      :clearable="true"
      class="my-3"
      @cleared="selectedToken = 'none'"
      @update:modelValue="handleGetDataFromDate"
    />
    <div
      v-if="canShowDatePrice"
      class="my-8 text-center"
    >
      {{ selectedToken }} price at {{ format(selectedDate, 'MM/dd/yyyy') }} was ${{ selectedDatePrice }}
    </div>
    <div
      v-else-if="loadings.isFetchingTokenOnDate"
      class="flex justify-center my-8"
    >
      <LoadingSpinner />
    </div>
  </div>
  <GlobalLoadingSpinner v-else />
</template>

<style scoped>
</style>
