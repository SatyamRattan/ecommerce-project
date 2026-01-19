from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_user_is_staff'),
        ('admin', '0003_logentry_add_action_flag_choices'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE django_admin_log 
                DROP CONSTRAINT IF EXISTS django_admin_log_user_id_c564eba6_fk_auth_user_id;
                
                ALTER TABLE django_admin_log 
                ADD CONSTRAINT django_admin_log_user_id_fk_users_user_id 
                FOREIGN KEY (user_id) REFERENCES users_user(id) 
                DEFERRABLE INITIALLY DEFERRED;
            """,
            reverse_sql="""
                ALTER TABLE django_admin_log 
                DROP CONSTRAINT IF EXISTS django_admin_log_user_id_fk_users_user_id;
                
                ALTER TABLE django_admin_log 
                ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id 
                FOREIGN KEY (user_id) REFERENCES auth_user(id) 
                DEFERRABLE INITIALLY DEFERRED;
            """
        ),
    ]
