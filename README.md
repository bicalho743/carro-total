# CarroTotal

Calculadora realista do custo total de um carro no Brasil.

## O que calcula

- Financiamento (sistema Price com taxas reais CDC)
- IPVA automático por estado
- Seguro, manutenção, combustível, estacionamento
- Desvalorização estimada (tabela FIPE)
- Custo de oportunidade (Selic)
- Comparativo Carro vs Uber/99

## Stack

- Expo (React Native) + TypeScript
- Zustand + AsyncStorage
- React Navigation (bottom tabs + stack)
- API FIPE pública (parallelum.com.br)

## Package

`com.corujalabs.carrototal`

## Rodar

```bash
# Desenvolvimento (Expo Go via QR)
npx expo start --host lan

# Build nativo Android
npx expo run:android

# AAB para Play Store → Android Studio > Generate Signed Bundle
```

## Build para Play Store

1. `npx expo prebuild --platform android`
2. Abrir `android/` no Android Studio
3. Usar keystore Coruja Labs (`coruja_labs.jks`)
4. Build > Generate Signed Bundle > Android App Bundle
5. Upload no Play Console: `corujalabs_dev@gmail.com`
