
export default abstract class BaseSeeder {
    public async run() {}

    public static runSeeder(seederName: string, seeder: BaseSeeder) {
        /** 
         * the mode can be set from command line interface by writing `{tableName}={mode}` after the `run:seeders` 
         * script
         */
        const shouldRun = process.argv.includes(`${seederName}`)
    
        if (shouldRun) {
            try {
                seeder.run()
            } catch (e: any) {
                console.error(`[database] error: an error occurred during ${seederName} seeder running: ${e.message}`)
            }
        }
    
        console.log(`[database] info: seeder ${seederName} successfully applied.`)
    }    
}
