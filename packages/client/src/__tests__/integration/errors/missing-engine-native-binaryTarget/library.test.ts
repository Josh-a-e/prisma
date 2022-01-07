import { getNodeAPIName, getPlatform } from '@prisma/get-platform'
import { ClientEngineType, getClientEngineType } from '@prisma/sdk'
import fs from 'fs'
import path from 'path'
import { generateTestClient } from '../../../../utils/getTestClient'

test('missing-engine-native-binaryTarget: library', async () => {
  if (getClientEngineType() !== ClientEngineType.Library) {
    return
  }

  expect.assertions(1)
  await generateTestClient()

  const { PrismaClient } = require('./node_modules/@prisma/client')

  const platform = await getPlatform()
  const binaryPath =
    getClientEngineType() === ClientEngineType.Library
      ? path.join(__dirname, 'node_modules/.prisma/client', getNodeAPIName(platform, 'fs'))
      : path.join(__dirname, 'node_modules/.prisma/client', `query-engine-${platform}`)
  fs.unlinkSync(binaryPath)
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
    ],
  })

  await expect(async () => {
    await prisma.user.findMany()
  }).rejects.toThrowErrorMatchingInlineSnapshot(`

          Invalid \`prisma.user.findMany()\` invocation in
          <PROJECT_ROOT>/library.test.ts:33:23

            30 })
            31 
            32 await expect(async () => {
          → 33   await prisma.user.findMany(
            Query engine library for current platform "TEST_PLATFORM" could not be found.
          You incorrectly pinned it to TEST_PLATFORM

          This probably happens, because you built Prisma Client on a different platform.
          (Prisma Client looked in "<PROJECT_ROOT>/node_modules/@prisma/client/runtime/libquery_engine-TEST_PLATFORM.dylib.node")

          Searched Locations:

            <PROJECT_ROOT>/node_modules/.prisma/client
            <PROJECT_ROOT>/node_modules/@prisma/client/runtime
            <PROJECT_ROOT>/node_modules/@prisma/client
            <PROJECT_ROOT>/node_modules/.prisma/client
            <PROJECT_ROOT>
            /tmp/prisma-engines
            <PROJECT_ROOT>/node_modules/.prisma/client

          You already added the platform "native" to the "generator" block
          in the "schema.prisma" file as described in https://pris.ly/d/client-generator,
          but something went wrong. That's suboptimal.

          Please create an issue at https://github.com/prisma/prisma/issues/new
        `)
})
