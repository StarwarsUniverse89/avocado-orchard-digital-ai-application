# AMD Cloud Cost Control Checklist
## Avocado Orchard Digital AI Application

## Pre-Launch Checklist

### Before Starting Instance

- [ ] Review current AMD Cloud credit balance
- [ ] Confirm budget allocation ($30-40 for demo)
- [ ] Set up billing alerts ($25, $50, $75)
- [ ] Have all code and data ready locally
- [ ] Test scripts work on local CPU first
- [ ] Document exact tasks to complete
- [ ] Set time limit for session (max 3 hours)
- [ ] Have termination procedure ready

---

## Instance Launch Checklist

### Starting the Instance

- [ ] Select correct instance type (AMD MI300X)
- [ ] Choose appropriate region (lowest cost)
- [ ] Verify hourly rate before launching
- [ ] Note instance ID and IP address
- [ ] Record start time
- [ ] Set personal timer/alarm for session end

### Initial Setup (Budget: 15 minutes)

- [ ] SSH into instance successfully
- [ ] Verify GPU is accessible (`rocm-smi`)
- [ ] Check ROCm version (`rocminfo`)
- [ ] Clone repository
- [ ] Install dependencies (use cached wheels if possible)
- [ ] Run quick GPU test
- [ ] **CHECKPOINT:** If setup fails, terminate immediately

---

## During Work Session

### Active Monitoring

- [ ] Check GPU utilization every 15 minutes
- [ ] Monitor cost dashboard every 30 minutes
- [ ] Keep terminal logs of all commands
- [ ] Save results incrementally (don't wait until end)
- [ ] Take screenshots as you go
- [ ] Document any errors immediately

### Time Management

- [ ] AI Agent Testing: Max 2 hours
- [ ] Vision Model Testing: Max 1 hour
- [ ] Training Demo: Max 1 hour
- [ ] Buffer for issues: 30 minutes
- [ ] **HARD STOP:** 4 hours total

### Cost Checkpoints

**After 1 hour:**
- [ ] Verify cost is ~$3-4
- [ ] Confirm progress is on track
- [ ] Decision: Continue or terminate

**After 2 hours:**
- [ ] Verify cost is ~$6-8
- [ ] Have minimum viable results
- [ ] Decision: Continue or wrap up

**After 3 hours:**
- [ ] Verify cost is ~$9-12
- [ ] Begin cleanup process
- [ ] Prepare for termination

---

## Task Completion Checklist

### AI Agent Inference

- [ ] Model loaded successfully
- [ ] Generated 10+ recommendations
- [ ] Measured inference latency (<2s target)
- [ ] Captured output examples
- [ ] Saved logs
- [ ] Took screenshots

### Vision Model Inference

- [ ] Model loaded successfully
- [ ] Processed sample images
- [ ] Measured throughput (images/sec)
- [ ] Compared CPU vs GPU performance
- [ ] Saved results
- [ ] Documented findings

### Training Demo

- [ ] Data loaded successfully
- [ ] Training script executed
- [ ] Captured training metrics
- [ ] Saved model weights
- [ ] Compared GPU vs CPU speed
- [ ] Documented results

---

## Shutdown Checklist

### Before Terminating Instance

- [ ] Download all results to local machine
- [ ] Download all logs
- [ ] Download all screenshots
- [ ] Download trained model weights
- [ ] Verify all files transferred successfully
- [ ] Double-check nothing important left on instance

### Termination Process

- [ ] Stop all running processes
- [ ] Exit SSH session
- [ ] Terminate instance via AMD Cloud dashboard
- [ ] Verify instance status shows "Terminated"
- [ ] Wait 5 minutes and check again
- [ ] Verify no other instances are running

### Post-Termination Verification

- [ ] Check AMD Cloud dashboard shows no active instances
- [ ] Verify billing has stopped
- [ ] Review total cost incurred
- [ ] Confirm cost is within budget
- [ ] Document final cost
- [ ] Save billing receipt/screenshot

---

## Emergency Procedures

### If Cost Exceeds Budget

**At $40 (Alert Level 1):**
- [ ] Immediately save current work
- [ ] Download critical results
- [ ] Terminate instance within 15 minutes

**At $60 (Alert Level 2):**
- [ ] STOP ALL WORK IMMEDIATELY
- [ ] Download whatever is available
- [ ] Terminate instance NOW
- [ ] Investigate cause of overrun

**At $80 (Alert Level 3):**
- [ ] EMERGENCY TERMINATION
- [ ] Contact AMD Cloud support
- [ ] Review all active resources
- [ ] Dispute charges if error

### If Instance Won't Terminate

1. [ ] Try termination via dashboard again
2. [ ] Try termination via CLI
3. [ ] Contact AMD Cloud support immediately
4. [ ] Document issue with screenshots
5. [ ] Request manual termination
6. [ ] Monitor billing closely

### If Locked Out of Instance

1. [ ] Don't panic - instance can still be terminated
2. [ ] Terminate via dashboard (don't try to fix access)
3. [ ] Accept loss of unsaved work
4. [ ] Budget protection is priority #1

---

## Cost Tracking Template

```
Session Date: ___________
Start Time: ___________
End Time: ___________
Duration: ___________ hours

Instance Type: AMD MI300X
Hourly Rate: $___________

Tasks Completed:
- [ ] AI Agent Inference
- [ ] Vision Model Inference  
- [ ] Training Demo
- [ ] Other: ___________

Total Cost: $___________
Budget Remaining: $___________

Results Saved: Yes / No
Instance Terminated: Yes / No
Billing Stopped: Yes / No
```

---

## Best Practices

### DO:
✅ Set multiple alarms/timers  
✅ Save work frequently  
✅ Download results incrementally  
✅ Monitor costs in real-time  
✅ Terminate immediately when done  
✅ Verify termination multiple times  
✅ Keep detailed logs  
✅ Have backup plans

### DON'T:
❌ Leave instance running unattended  
❌ Assume auto-shutdown works  
❌ Wait until end to download results  
❌ Ignore cost alerts  
❌ Start without clear plan  
❌ Try to "fix" issues on expensive instance  
❌ Use instance for non-essential tasks  
❌ Forget to verify termination

---

## Success Metrics

**Cost Control Success:**
- Total spend ≤ $40
- No surprise charges
- All instances properly terminated
- Billing stopped within 5 minutes of termination

**Work Success:**
- All planned tasks completed
- Results documented
- Screenshots captured
- Code tested and working

---

## Contact Information

**AMD Cloud Support:**  
- Dashboard: https://www.amd.com/en/developer/resources/developer-cloud.html
- Email: developer-cloud@amd.com
- Emergency: Check dashboard for support options

**Billing Questions:**  
- Check AMD Cloud billing dashboard
- Review usage reports
- Contact support if discrepancies

---

## Post-Session Review

After each session, complete this review:

- [ ] Total cost was within budget
- [ ] All results were saved
- [ ] Instance was terminated
- [ ] Billing has stopped
- [ ] Lessons learned documented
- [ ] Next session planned (if needed)

**Lessons Learned:**
```
What went well:


What could be improved:


Cost optimization opportunities:


Technical issues encountered:


```

---

**Last Updated:** May 5, 2026  
**Status:** Ready for use  
**Budget:** $100 total, $30-40 allocated for demo

---

# Made with Bob