/** Ensures all necessary environment variables are set for the current environment (production / development) */
export function validateEnvironment() {
  /** What environment the app is currently in */
  const isProduction = import.meta.env.PROD

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

  // Production requirements
  if (isProduction) {
    checkVariable('VITE_BASE_URL', 'unable to make api calls')
  }
}
