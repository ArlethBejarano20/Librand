import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gacpfehcnzdflgexwsnk.supabase.co'
const supabaseKey = 'sb_publishable_IWWSFJPh4p_Iom5Bv3qKmA_hiEnF3hw' 


export const supabase = createClient(supabaseUrl, supabaseKey)


