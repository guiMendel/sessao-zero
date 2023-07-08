/** Ensures all necessary environment variables are set for the current environment (production / development) */
export function validateEnvironment() {
  /** Helper that allows to quickly check if an env variable is set, and throws an error in case not
   * @param variable Which variable to check for
   * @param errorMessage Provides the reason why this variable is necessary
   */
  function checkVariable(variable: string, errorMessage: string) {
    // Api base Url
    if (import.meta.env[variable] == undefined)
      throw new Error(
        `Environment variable "${variable}" not set${
          errorMessage ? ': ' + errorMessage : ''
        }`
      )
  }

  checkVariable('VITE_API_KEY', 'api key para acessar o firebase')
  checkVariable('VITE_MESSAGING_SENDER_ID', 'messaging sender id para interagir com o firebase')
  checkVariable('VITE_APP_ID', 'app id para acessar o app do firebase')
}
